// BackEnd/controllers/analyticsController.js

const mongoose = require('mongoose'); // THÊM MONGOOSE ĐỂ XỬ LÝ OBJECT ID
const Product = require('../models/Product');
const Review = require('../models/Review');
const InventoryAdvice = require('../models/InventoryAdvice');
const TrendComparison = require('../models/TrendComparison');
const MarketingTarget = require('../models/MarketingTarget');
const AdminDashboard = require('../models/AdminDashboard');
const NewProductSupport = require('../models/NewProductSupport');
const SmartCatalog = require('../models/SmartCatalog');

const fs = require('fs'); 
const path = require('path'); 

// ==============================================================
// 1. CÁC HÀM THỐNG KÊ NGẦM (GIỮ NGUYÊN HOẠT ĐỘNG CACHE)
// ==============================================================
const fetchTotalProducts = () => Product.estimatedDocumentCount();
const fetchTotalReviews = () => Review.estimatedDocumentCount();

const fetchAvgRating = async () => {
    const data = await Review.aggregate([{ $group: { _id: null, avgOverall: { $avg: "$overall" } } }]);
    return data.length > 0 ? data[0].avgOverall.toFixed(2) : "0.00";
};

const fetchTotalUsers = async () => {
    const data = await Review.aggregate([
        { $group: { _id: "$reviewerID" } },
        { $count: "total" }
    ]).allowDiskUse(true);
    return data.length > 0 ? data[0].total : 0;
};

const fetchReviewsByTime = async () => {
    const data = await Review.aggregate([
        { $match: { unixReviewTime: { $exists: true, $type: "number" } } },
        { 
            $group: { 
                _id: { 
                    year: { $year: { $toDate: { $multiply: ["$unixReviewTime", 1000] } } },
                    month: { $month: { $toDate: { $multiply: ["$unixReviewTime", 1000] } } },
                    day: { $dayOfMonth: { $toDate: { $multiply: ["$unixReviewTime", 1000] } } }
                }, 
                count: { $sum: 1 } 
            } 
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]).allowDiskUse(true);

    return data.map(item => ({ 
        year: item._id.year, month: item._id.month, day: item._id.day, count: item.count 
    }));
};

const fetchAllCategories = async () => {
    const data = await Product.aggregate([
        { $match: { main_cat: { $ne: null, $ne: "" } } },
        { $group: { _id: "$main_cat", count: { $sum: 1 } } },
        { $sort: { count: -1 } } 
    ]);
    return data.map(item => ({ name: item._id, count: item.count }));
};

const fetchRatingDistribution = async () => {
    const data = await Review.aggregate([
        { $group: { _id: "$overall", count: { $sum: 1 } } },
        { $sort: { _id: -1 } } 
    ]).allowDiskUse(true);
    
    return data.map(item => ({ name: `${item._id} Sao`, count: item.count }));
};

const fetchVerifiedPurchases = async () => {
    const total = await Review.estimatedDocumentCount();
    return [{ name: "Đã mua hàng (Verified)", count: total }];
};

const fetchTopBrands = async () => {
    const data = await Product.aggregate([
        { $match: { brand: { $ne: null, $ne: "" } } },
        { $group: { _id: "$brand", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 } 
    ]);
    return data.map(item => ({ name: item._id, count: item.count }));
};

const CACHE_FILE_PATH = path.join(__dirname, '../stats_cache.json'); 
let cachedStats = null;
let isCalculating = false;

const runBackgroundAnalytics = async () => {
    isCalculating = true; 
    try {
        const avgRating = await fetchAvgRating();
        const totalUsers = await fetchTotalUsers();
        const reviewsByTime = await fetchReviewsByTime();
        const allCategories = await fetchAllCategories();
        const ratingDistribution = await fetchRatingDistribution();
        const verifiedPurchases = await fetchVerifiedPurchases();
        const topBrands = await fetchTopBrands();

        cachedStats = {
            avgRating, totalUsers, reviewsByTime, allCategories, 
            ratingDistribution, verifiedPurchases, topBrands
        };

        fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cachedStats), 'utf-8');
    } catch (err) {
        console.error("[BI Cache] Lỗi chạy thống kê nền:", err);
    } finally {
        isCalculating = false; 
    }
};

const getSystemStats = async (req, res) => {
    try {
        const totalProducts = await fetchTotalProducts();
        const totalReviews = await fetchTotalReviews();

        if (!cachedStats && fs.existsSync(CACHE_FILE_PATH)) {
            const rawData = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
            cachedStats = JSON.parse(rawData);
        }

        if (!cachedStats && !isCalculating) {
            runBackgroundAnalytics(); 
        }

        if (cachedStats) {
            res.json({ ...cachedStats, totalProducts, totalReviews, status: "ready" });
        } else {
            res.json({
                totalProducts, totalReviews, avgRating: "0.00", totalUsers: 0,
                reviewsByTime: [], allCategories: [], 
                ratingDistribution: [], verifiedPurchases: [], topBrands: [],
                status: "calculating"
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

const recalculateStats = (req, res) => {
    try {
        if (isCalculating) return res.status(400).json({ message: "Hệ thống đang bận tính toán rồi!" });
        
        cachedStats = null;
        if (fs.existsSync(CACHE_FILE_PATH)) fs.unlinkSync(CACHE_FILE_PATH);
        
        runBackgroundAnalytics();
        res.json({ message: "Đã ra lệnh tính toán lại thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// ==============================================================
// 2. CÁC HÀM TRUY VẤN ĐỘNG TRỰC TIẾP TỪ DATABASE (BỘ LỌC AN TOÀN SELLER)
// ==============================================================

/**
 * 2.1 TRUY VẤN XU HƯỚNG ĐỐI SOÁT (Trend Comparison)
 */
const getTrendComparison = async (req, res) => {
    try {
        let compareData = await TrendComparison.findOne({
            $or: [
                { page: "compare_history_vs_model" },
                { compare_history_vs_model: { $exists: true } },
                { stable_history_and_model: { $exists: true } }
            ]
        }).lean();

        // FALLBACK: Lấy từ smart_catalog làm gốc
        if (!compareData || (!compareData.stable_history_and_model && !compareData.compare_history_vs_model)) {
            const compactData = await SmartCatalog.findOne({
                $or: [
                    { compare_history_vs_model: { $exists: true } },
                    { page: "compact" }
                ]
            }).lean();
            if (compactData) {
                compareData = compactData.compare_history_vs_model || compactData;
            }
        }

        if (!compareData) {
            return res.status(404).json({ 
                status: "error", 
                message: "Không tìm thấy dữ liệu đối soát xu hướng." 
            });
        }

        const baseData = compareData.compare_history_vs_model || compareData;

        // BẢO MẬT GIAN HÀNG: Chỉ lọc các ASIN thuộc quyền sở hữu của Seller này
        let allowedAsins = null;
        if (req.user && req.user.role !== 2) {
            let sellerId = req.user.id;
            let sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId) ? new mongoose.Types.ObjectId(sellerId) : sellerId;

            const myProducts = await Product.find({ 
                $or: [{ seller_id: sellerId }, { seller_id: sellerObjectId }]
            }).select('asin').lean();
            allowedAsins = myProducts.map(p => p.asin).filter(asin => asin != null);
        }

        const filterData = (arr) => {
            if (!arr) return [];
            if (req.user.role === 2) return arr; // Admin xem toàn bộ
            return arr.filter(item => allowedAsins.includes(item.asin)); 
        };

        const finalData = {
            stable_history_and_model: filterData(baseData.stable_history_and_model),
            future_trend_by_model: filterData(baseData.future_trend_by_model),
            historical_popular_only: filterData(baseData.historical_popular_only),
            low_priority_watchlist: filterData(baseData.low_priority_watchlist)
        };

        res.json({ ...finalData, status: "ready" });
    } catch (error) {
        console.error("Lỗi đọc Trend Comparison DB:", error);
        res.status(500).json({ message: "Lỗi Server khi đọc dữ liệu xu hướng" });
    }
};

/**
 * 2.2 TRUY VẤN TRỢ LÝ QUYẾT ĐỊNH NHẬP HÀNG (Inventory Advice)
 * Bộ lọc trong bộ nhớ an toàn (In-Memory Filter) tránh lỗi sập DB Join của Mongoose
 */
const getInventoryAdvice = async (req, res) => {
    try {
        const isSeller = req.user && req.user.role !== 2;
        let rawItems = [];

        // 1. Tải mảng AI gốc từ Database
        const aiData = await InventoryAdvice.find({}).lean();
        if (aiData && aiData.length > 0) {
            const nestedDoc = aiData.find(doc => doc.inventory || doc.best_inventory_items || doc.explainable_procurement);
            if (nestedDoc) {
                const invObject = nestedDoc.inventory || nestedDoc;
                rawItems = invObject.best_inventory_items || invObject.explainable_procurement || [];
            } else {
                rawItems = aiData;
            }
        }

        // 2. PHÂN QUYỀN SELLER TRÊN RAM (AN TOÀN TUYỆT ĐỐI)
        if (isSeller) {
            let sellerId = req.user.id;
            let sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId) ? new mongoose.Types.ObjectId(sellerId) : sellerId;

            // Tìm toàn bộ ASIN do Seller sở hữu trong 'item_features' (Mongoose tự ép kiểu ObjectId)
            const myProducts = await Product.find({ 
                $or: [
                    { seller_id: sellerId }, 
                    { seller_id: sellerObjectId }
                ]
            }).select('asin').lean();

            const allowedAsins = myProducts.map(p => p.asin).filter(asin => asin != null);

            // Thực hiện lọc mảng siêu tốc độ trên RAM
            rawItems = rawItems.filter(item => allowedAsins.includes(item.asin));
        }

        if (!rawItems || rawItems.length === 0) {
            return res.json({ enriched_items: [], status: "ready" });
        }

        // 3. Chuẩn hóa dữ liệu trả về
        const enrichedItems = rawItems.map(item => {
            const rawPrice = item.price_clean || item.price || item.Price || 0;
            let cleanPrice = 0;
            if (typeof rawPrice === 'string') {
                cleanPrice = parseFloat(rawPrice.replace(/[^0-9.-]+/g, "")) || 0;
            } else {
                cleanPrice = parseFloat(rawPrice) || 0;
            }

            const rank = item.user_based_inventory_rank || item.predicted_rank || item.historical_rank || 999;
            const userCount = item.predicted_user_count || item.historical_unique_users || 0;

            let action = item.inventory_action || item.inventory_decision || item.procurement_decision_type || "monitor";
            const rawActionLower = String(action).toLowerCase();
            
            if (rawActionLower.includes("high") || rawActionLower.includes("an toàn") || rawActionLower.includes("ưu tiên nhập")) {
                action = "priority_import_future_trend";
            } else if (rawActionLower.includes("medium") || rawActionLower.includes("nhập thử") || rawActionLower.includes("cân nhắc")) {
                action = "consider_import";
            } else if (rawActionLower.includes("low") || rawActionLower.includes("hạn chế")) {
                action = "monitor";
            } else if (rawActionLower.includes("over") || rawActionLower.includes("tránh")) {
                action = "avoid_over_import_old_trend";
            } else {
                action = "monitor";
            }

            return {
                ...item,
                asin: item.asin || item.item_id?.toString() || "N/A",
                title: item.title || "Sản phẩm công nghệ",
                brand: item.brand || "N/A",
                price: cleanPrice,
                predicted_rank: rank,
                predicted_user_count: userCount,
                inventory_action: action,
                image_url: item.image_url || null
            };
        });

        res.json({ 
            enriched_items: enrichedItems, 
            status: "ready" 
        });

    } catch (error) {
        console.error("Lỗi đồng bộ dữ liệu nhập hàng:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

/**
 * 2.3 TRUY VẤN MỤC TIÊU MARKETING (Marketing Targets)
 */
const getMarketingTargets = async (req, res) => {
    try {
        let marketingData = await MarketingTarget.findOne({
            $or: [
                { page: "marketing" },
                { marketing: { $exists: true } },
                { best_marketing_targets: { $exists: true } }
            ]
        }).lean();

        if (!marketingData || (!marketingData.best_marketing_targets && !marketingData.marketing)) {
            const compactData = await SmartCatalog.findOne({
                $or: [
                    { marketing: { $exists: true } },
                    { page: "compact" }
                ]
            }).lean();
            if (compactData) {
                marketingData = compactData;
            }
        }

        if (!marketingData) {
            return res.status(404).json({ message: "Không tìm thấy dữ liệu trong collection marketing_targets." });
        }

        const baseData = marketingData.marketing || marketingData;
        let bestTargets = marketingData.best_marketing_targets || baseData.best_marketing_targets || [];

        // LỌC CHO SELLER
        if (req.user && req.user.role !== 2) {
            let sellerId = req.user.id;
            let sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId) ? new mongoose.Types.ObjectId(sellerId) : sellerId;

            const myProducts = await Product.find({ 
                $or: [{ seller_id: sellerId }, { seller_id: sellerObjectId }]
            }).select('asin').lean();
            
            const allowedAsins = myProducts.map(p => p.asin).filter(asin => asin != null);
            bestTargets = bestTargets.filter(item => allowedAsins.includes(item.asin));
        }

        const finalData = {
            ...baseData,
            best_marketing_targets: bestTargets,
            scenario_summary: marketingData.scenario_summary || baseData.scenario_summary || []
        };

        res.json({ ...finalData, status: "ready" });
    } catch (error) {
        console.error("Lỗi đọc Marketing DB:", error);
        res.status(500).json({ message: "Lỗi Server khi đọc dữ liệu marketing" });
    }
};

/**
 * 2.4 TRUY VẤN HỖ TRỢ SẢN PHẨM MỚI (New Product Support)
 */
const getNewProductSupport = async (req, res) => {
    try {
        let productData = await NewProductSupport.findOne({
            $or: [
                { page: "new_product_support" },
                { new_product_support: { $exists: true } },
                { case7a_similar_or_replacement_product: { $exists: true } }
            ]
        }).lean();

        if (!productData || (!productData.case7a_similar_or_replacement_product && !productData.new_product_support)) {
            const compactData = await SmartCatalog.findOne({
                $or: [
                    { new_product_support: { $exists: true } },
                    { page: "compact" }
                ]
            }).lean();
            if (compactData) {
                productData = compactData;
            }
        }

        if (!productData) {
            return res.status(404).json({ message: "Không tìm thấy dữ liệu trong collection new_product_support." });
        }

        const baseData = productData.new_product_support || productData;
        const finalData = {
            ...baseData,
            case7a_similar_or_replacement_product: productData.case7a_similar_or_replacement_product || baseData.case7a_similar_or_replacement_product || {},
            case7b_completely_new_product: productData.case7b_completely_new_product || baseData.case7b_completely_new_product || {}
        };

        res.json({ ...finalData, status: "ready" });
    } catch (error) {
        console.error("Lỗi đọc New Product DB:", error);
        res.status(500).json({ message: "Lỗi Server khi đọc dữ liệu hỗ trợ sản phẩm mới" });
    }
};

/**
 * 2.5 TRUY VẤN DANH MỤC THÔNG MINH (Smart Catalog)
 */
const getSmartCatalog = async (req, res) => {
    try {
        const allData = await SmartCatalog.findOne({
            $or: [
                { page: "compact" },
                { compare_history_vs_model: { $exists: true } },
                { history: { $exists: true } }
            ]
        }).lean() || await SmartCatalog.findOne({}).lean();

        if (!allData) {
            return res.status(404).json({ message: "Không tìm thấy dữ liệu trong collection smart_catalog." });
        }

        const trendingProducts = allData.compare_history_vs_model?.future_trend_by_model || allData.trending || [];
        const popularProducts = allData.history?.items || allData.popular || [];
        const aiRecommended = allData.compare_history_vs_model?.stable_history_and_model || allData.recommended || [];

        res.json({ 
            trending: trendingProducts, 
            popular: popularProducts, 
            recommended: aiRecommended,
            status: "ready" 
        });

    } catch (error) {
        console.error("Lỗi đọc Catalog DB:", error);
        res.status(500).json({ message: "Lỗi Server khi tải danh mục thông minh" });
    }
};

/**
 * 2.6 TRUY VẤN DASHBOARD QUẢN TRỊ AI (Admin Dashboard)
 */
const getAiDashboardData = async (req, res) => {
    try {
        let dashboardData = await AdminDashboard.findOne({
            $or: [
                { page: "dashboard" },
                { dashboard: { $exists: true } },
                { ablation_summary: { $exists: true } }
            ]
        }).lean();

        if (!dashboardData || (!dashboardData.ablation_summary && !dashboardData.dashboard)) {
            const compactData = await SmartCatalog.findOne({
                $or: [
                    { dashboard: { $exists: true } },
                    { page: "compact" }
                ]
            }).lean();
            if (compactData) {
                dashboardData = compactData;
            }
        }
        
        if (!dashboardData) {
            return res.status(404).json({ message: "Không tìm thấy dữ liệu trong collection admin_dashboard." });
        }

        const baseData = dashboardData.dashboard ? dashboardData.dashboard : dashboardData;
        
        const finalData = {
            ...baseData,
            ablation_summary: dashboardData.ablation_summary || baseData.ablation_summary || [],
            model_metrics: dashboardData.model_metrics || baseData.model_metrics || [],
            available_data_signals: dashboardData.available_data_signals || baseData.available_data_signals || [],
            missing_business_data: dashboardData.missing_business_data || baseData.missing_business_data || []
        };

        res.json(finalData);
    } catch (error) {
        console.error("Lỗi đọc Dashboard DB:", error);
        res.status(500).json({ message: "Lỗi Server khi đọc dữ liệu Dashboard AI" });
    }
};

module.exports = { 
    getSystemStats, recalculateStats, getTrendComparison, 
    getInventoryAdvice, getMarketingTargets, getNewProductSupport, 
    getSmartCatalog, getAiDashboardData 
};