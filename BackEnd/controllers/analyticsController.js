const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Product = require('../models/Product');
const Review = require('../models/Review');
const SmartCatalog = require('../models/SmartCatalog');
const User = require('../models/User'); 
const Recommendation = require('../models/Recommendation');
// =======================================================
// 1. HELPER FUNCTIONS
// Các hàm hỗ trợ dùng nội bộ, không export trực tiếp cho route
// =======================================================

/**
 * Đếm tổng số sản phẩm trong hệ thống.
 * Dùng cho dashboard thống kê tổng quan.
 */
const fetchTotalProducts = () => Product.estimatedDocumentCount();

/**
 * Đếm tổng số review trong hệ thống.
 * Dùng cho dashboard thống kê tổng quan.
 */
const fetchTotalReviews = () => Review.estimatedDocumentCount();

/**
 * Tính điểm rating trung bình toàn hệ thống.
 * Dữ liệu lấy từ collection Review.
 */
const fetchAvgRating = async () => {
    const data = await Review.aggregate([
        {
            $group: {
                _id: null,
                avgOverall: { $avg: '$overall' }
            }
        }
    ]);

    return data.length > 0 ? data[0].avgOverall.toFixed(2) : '0.00';
};

/**
 * Đếm tổng số user duy nhất dựa trên reviewerID.
 * Dùng Review để thống kê người dùng thực tế có tương tác.
 */
const fetchTotalUsers = async () => {
    const data = await Review.aggregate([
        { $group: { _id: '$reviewerID' } },
        { $count: 'total' }
    ]).allowDiskUse(true);

    return data.length > 0 ? data[0].total : 0;
};

/**
 * Thống kê số lượng review theo từng ngày/tháng/năm.
 * Dùng để vẽ biểu đồ tăng trưởng tương tác theo thời gian.
 */
const fetchReviewsByTime = async () => {
    const data = await Review.aggregate([
        {
            $match: {
                unixReviewTime: {
                    $exists: true,
                    $type: 'number'
                }
            }
        },
        {
            $group: {
                _id: {
                    year: {
                        $year: {
                            $toDate: {
                                $multiply: ['$unixReviewTime', 1000]
                            }
                        }
                    },
                    month: {
                        $month: {
                            $toDate: {
                                $multiply: ['$unixReviewTime', 1000]
                            }
                        }
                    },
                    day: {
                        $dayOfMonth: {
                            $toDate: {
                                $multiply: ['$unixReviewTime', 1000]
                            }
                        }
                    }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                '_id.year': 1,
                '_id.month': 1,
                '_id.day': 1
            }
        }
    ]).allowDiskUse(true);

    return data.map((item) => ({
        year: item._id.year,
        month: item._id.month,
        day: item._id.day,
        count: item.count
    }));
};

/**
 * Thống kê toàn bộ danh mục sản phẩm.
 * Dùng để vẽ biểu đồ phân bố sản phẩm theo main_cat.
 */
const fetchAllCategories = async () => {
    const data = await Product.aggregate([
        {
            $match: {
                main_cat: {
                    $ne: null,
                    $ne: ''
                }
            }
        },
        {
            $group: {
                _id: '$main_cat',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    return data.map((item) => ({
        name: item._id,
        count: item.count
    }));
};

/**
 * Thống kê phân phối rating.
 * Ví dụ: bao nhiêu review 5 sao, 4 sao, 3 sao.
 */
const fetchRatingDistribution = async () => {
    const data = await Review.aggregate([
        {
            $group: {
                _id: '$overall',
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: -1 } }
    ]).allowDiskUse(true);

    return data.map((item) => ({
        name: `${item._id} Sao`,
        count: item.count
    }));
};

/**
 * 🌟 MỚI: Thống kê Phân khúc giá sản phẩm (Price Tiers)
 */
/**
 * 🌟 MỚI: Thống kê Phân khúc giá sản phẩm (Price Tiers) - Đã chống Data Bẩn
 */
/**
 * 🌟 MỚI: Thống kê Phân khúc giá sản phẩm (Price Tiers) - Đã sửa lỗi ép kiểu
 */
/**
 * 🌟 MỚI: Thống kê Phân khúc giá sản phẩm (Price Tiers) - Đã FIX lỗi FieldPath và ép kiểu an toàn
 */
const fetchPriceDistribution = async () => {
    try {
        const data = await Product.aggregate([
            {
                // Bước 1: Lấy giá, ưu tiên price_clean
                $project: {
                    rawPrice: { $ifNull: ['$price_clean', '$price'] }
                }
            },
            {
                // Bước 2: Ép kiểu an toàn sang số thực (Double)
                $project: {
                    parsedPrice: {
                        $convert: {
                            input: {
                                $cond: {
                                    if: { $eq: [{ $type: "$rawPrice" }, "string"] },
                                    // 🌟 FIX LỖI: Dùng { $literal: "$" } để tránh lỗi FieldPath
                                    then: { $ltrim: { input: "$rawPrice", chars: { $literal: "$" } } }, 
                                    else: "$rawPrice"
                                }
                            },
                            to: "double",
                            onError: null, // Nếu giá là chữ "Liên hệ" thì bỏ qua
                            onNull: null
                        }
                    }
                }
            },
            {
                // Bước 3: Chỉ lấy các giá hợp lệ > 0
                $match: { parsedPrice: { $ne: null, $gt: 0 } }
            },
            {
                // Bước 4: Phân nhóm
                $bucket: {
                    groupBy: '$parsedPrice',
                    boundaries: [0, 25, 50, 100, 200],
                    default: 200, 
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        const tierNames = {
            0: 'Dưới $25 (Giá rẻ)',
            25: '$25 - $50 (Phổ thông)',
            50: '$50 - $100 (Tầm trung)',
            100: '$100 - $200 (Cao cấp)',
            200: 'Trên $200 (Siêu cấp)'
        };

        return data.map(item => ({
            name: tierNames[item._id] || `Trên $200`,
            count: item.count
        }));
    } catch (error) {
        console.error("Lỗi gom nhóm giá:", error);
        return [];
    }
};
/**
 * Thống kê số lượt mua đã xác thực.
 * Hiện tại đang lấy tổng số review làm số lượng verified.
 */
const fetchVerifiedPurchases = async () => {
    const total = await Review.estimatedDocumentCount();

    return [
        {
            name: 'Đã mua hàng (Verified)',
            count: total
        }
    ];
};

/**
 * Thống kê top 10 thương hiệu có nhiều sản phẩm nhất.
 * Dùng cho dashboard BI.
 */
const fetchTopBrands = async () => {
    const data = await Product.aggregate([
        {
            $match: {
                brand: {
                    $ne: null,
                    $ne: ''
                }
            }
        },
        {
            $group: {
                _id: '$brand',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    return data.map((item) => ({
        name: item._id,
        count: item.count
    }));
};

/**
 * Lấy danh sách ASIN mà seller hiện tại sở hữu.
 * Admin không cần dùng hàm này để lọc.
 */
const getAllowedAsinsForSeller = async (req) => {
    if (!req.user || req.user.role === 2 || req.user.role === 0){
        return null;
    }

    const sellerId = req.user.id;

    const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId)
        ? new mongoose.Types.ObjectId(sellerId)
        : sellerId;

    const myProducts = await Product.find({
        $or: [
            { seller_id: sellerId },
            { seller_id: sellerObjectId }
        ]
    })
        .select('asin')
        .lean();

    return myProducts
        .map((product) => product.asin)
        .filter((asin) => asin != null);
};

/**
 * Lọc mảng AI theo danh sách ASIN của seller.
 * Admin được xem toàn bộ nên không lọc.
 */
const filterItemsBySellerPermission = (items, allowedAsins, req) => {
    if (!items) return [];
    if (!req.user || req.user.role === 2 || req.user.role === 0) return items;
    if (!Array.isArray(allowedAsins)) return [];

    return items.filter((item) => allowedAsins.includes(item.asin));
};

/**
 * Thống kê Top 5 Sản phẩm được mua/đánh giá nhiều nhất
 */
/**
 * Thống kê Top 5 Sản phẩm được mua/đánh giá nhiều nhất (Đã sửa lỗi không lấy được tên)
 */
const fetchTopReviewedProducts = async () => {
    const topReviews = await Review.aggregate([
        { $group: { _id: '$asin', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 100 }
    ]);

    // Trích xuất danh sách mã ASIN
    const asins = topReviews.map(r => r._id);

    // Bước 2: Dùng Mongoose lấy thông tin sản phẩm (Cách này tự động map đúng collection)
    const products = await Product.find({ asin: { $in: asins } }).select('asin title').lean();

    // Bước 3: Gắn tên vào biểu đồ
    return topReviews.map(review => {
        const matchedProduct = products.find(p => p.asin === review._id);
        
        // Lấy tên, nếu thực sự không có trong DB thì mới hiện ASIN
        const rawName = matchedProduct && matchedProduct.title ? matchedProduct.title : `ASIN: ${review._id}`;
        
        return {
            name: rawName.length > 30 ? rawName.substring(0, 30) + '...' : rawName,
            fullAsin: review._id,
            count: review.count
        };
    });
};
/**
 * Thống kê Top 5 Khách hàng mua/đánh giá nhiều nhất
 */
const fetchTopActiveUsers = async () => {
    const data = await Review.aggregate([
        { $group: { _id: '$reviewerID', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 100 }
    ]);

    return data.map(item => ({
        name: item._id, // Hiển thị mã reviewerID
        count: item.count
    }));
};
// =======================================================
// 2. SYSTEM STATS / BI CACHE FUNCTIONS
// Các hàm thống kê hệ thống, dùng cho Admin dashboard thống kê
// =======================================================

const CACHE_FILE_PATH = path.join(__dirname, '../stats_cache.json');
let cachedStats = null;
let isCalculating = false;

/**
 * Chạy thống kê nền và lưu cache ra file stats_cache.json.
 * Tránh phải aggregate nặng mỗi lần frontend gọi dashboard.
 */
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
        const topReviewedProducts = await fetchTopReviewedProducts();
        const topActiveUsers = await fetchTopActiveUsers();
        const priceDistribution = await fetchPriceDistribution();

        cachedStats = {
            avgRating,
            totalUsers,
            reviewsByTime,
            allCategories,
            ratingDistribution,
            verifiedPurchases,
            topBrands,
            topReviewedProducts, 
            topActiveUsers,
            priceDistribution
        };

        fs.writeFileSync(
            CACHE_FILE_PATH,
            JSON.stringify(cachedStats),
            'utf-8'
        );
    } catch (err) {
        console.error('[BI Cache] Lỗi chạy thống kê nền:', err);
    } finally {
        isCalculating = false;
    }
};

/**
 * Lấy thống kê tổng quan hệ thống.
 * Nếu đã có cache thì trả cache.
 * Nếu chưa có cache thì kích hoạt tính toán nền.
 */
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
            return res.json({
                ...cachedStats,
                totalProducts,
                totalReviews,
                status: 'ready'
            });
        }

        res.json({
            totalProducts,
            totalReviews,
            avgRating: '0.00',
            totalUsers: 0,
            reviewsByTime: [],
            allCategories: [],
            ratingDistribution: [],
            verifiedPurchases: [],
            topBrands: [],
            topReviewedProducts: [], 
            topActiveUsers: [],
            priceDistribution: [],
            status: 'calculating'
            
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi Server'
        });
    }
};

/**
 * Xóa cache cũ và yêu cầu hệ thống tính toán lại thống kê.
 * Dùng khi admin muốn refresh dữ liệu dashboard.
 */
const recalculateStats = (req, res) => {
    try {
        if (isCalculating) {
            return res.status(400).json({
                message: 'Hệ thống đang bận tính toán rồi!'
            });
        }

        cachedStats = null;

        if (fs.existsSync(CACHE_FILE_PATH)) {
            fs.unlinkSync(CACHE_FILE_PATH);
        }

        runBackgroundAnalytics();

        res.json({
            message: 'Đã ra lệnh tính toán lại thành công!'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi Server'
        });
    }
};

// =======================================================
// 3. SELLER + ADMIN AI BUSINESS FUNCTIONS
// Các hàm dùng chung cho Seller và Admin.
// Seller bị lọc dữ liệu theo sản phẩm của mình.
// Admin role 2 xem toàn bộ dữ liệu.
// =======================================================

/**
 * Lấy dữ liệu đối soát xu hướng.
 * Gồm:
 * - Hot ổn định
 * - Xu hướng mới
 * - Hot quá khứ
 * - Ít ưu tiên
 *
 * Seller chỉ thấy sản phẩm thuộc shop của mình.
 * Admin thấy toàn bộ.
 */
const getTrendComparison = async (req, res) => {
    try {
        // 1. Chọc thẳng vào SmartCatalog tìm khối dữ liệu compact
        const compactData = await SmartCatalog.findOne({
            $or: [
                { compare_history_vs_model: { $exists: true } },
                { page: 'compact' }
            ]
        }).lean();

        if (!compactData) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy dữ liệu đối soát xu hướng.'
            });
        }

        const baseData = compactData.compare_history_vs_model || compactData;
        const allowedAsins = await getAllowedAsinsForSeller(req);

        // 2. Lọc sản phẩm theo quyền (Seller/Admin/Customer)
        let finalData = {
            stable_history_and_model: filterItemsBySellerPermission(
                baseData.stable_history_and_model,
                allowedAsins,
                req
            ),
            future_trend_by_model: filterItemsBySellerPermission(
                baseData.future_trend_by_model,
                allowedAsins,
                req
            ),
            historical_popular_only: filterItemsBySellerPermission(
                baseData.historical_popular_only,
                allowedAsins,
                req
            ),
            low_priority_watchlist: filterItemsBySellerPermission(
                baseData.low_priority_watchlist,
                allowedAsins,
                req
            )
        };

        // =============================================================
        // 🌟 MỚI: TỰ ĐỘNG CHUẨN HÓA VÀ LẤY GIÁ TỪ BẢNG PRODUCT ĐẮP VÀO
        // =============================================================
        
        // Bước A: Gom tất cả mã ASIN từ 4 nhóm lại
        const allItems = [
            ...(finalData.stable_history_and_model || []),
            ...(finalData.future_trend_by_model || []),
            ...(finalData.historical_popular_only || []),
            ...(finalData.low_priority_watchlist || [])
        ];
        
        // Loại bỏ ASIN trùng lặp
        const allAsins = [...new Set(allItems.map(item => item.asin).filter(Boolean))];

        // Bước B: Truy vấn một lần duy nhất vào bảng Product để lấy giá và ảnh gốc
        const productsInDb = await Product.find({ asin: { $in: allAsins } })
            .select('asin price image_url_high image_url main_cat brand')
            .lean();

        // Bước C: Hàm đắp dữ liệu (Giá, Ảnh chuẩn, Danh mục) vào Item của AI
        const enrichItemWithRealData = (list) => {
            if (!list) return [];
            return list.map(item => {
                // Tìm thông tin gốc của sản phẩm dựa trên ASIN
                const dbInfo = productsInDb.find(p => p.asin === item.asin);
                
                return {
                    ...item,
                    // Đắp giá thật, nếu DB không có thì rà soát giá cũ của AI
                    price: dbInfo?.price ?? item.price ?? item.price_clean ?? 0,
                    
                    // Cập nhật luôn ảnh chất lượng cao nhất nếu có
                    image_url: dbInfo?.image_url_high || dbInfo?.image_url || item.image_url,
                    brand: dbInfo?.brand || item.brand,
                    main_cat: dbInfo?.main_cat || item.main_cat
                };
            });
        };

        // Bước D: Ghi đè lại 4 mảng sau khi đã đắp xong giá tiền
        finalData.stable_history_and_model = enrichItemWithRealData(finalData.stable_history_and_model);
        finalData.future_trend_by_model = enrichItemWithRealData(finalData.future_trend_by_model);
        finalData.historical_popular_only = enrichItemWithRealData(finalData.historical_popular_only);
        finalData.low_priority_watchlist = enrichItemWithRealData(finalData.low_priority_watchlist);

        // Trả kết quả hoàn chỉnh về cho Frontend
        res.json({ ...finalData, status: 'ready' });
    } catch (error) {
        console.error('Lỗi đọc Trend Comparison DB:', error);
        res.status(500).json({ message: 'Lỗi Server khi đọc dữ liệu xu hướng' });
    }
};
/**
 * Lấy dữ liệu trợ lý nhập hàng.
 */
const getInventoryAdvice = async (req, res) => {
    try {
        const isSeller = req.user && req.user.role !== 2;
        let rawItems = [];

        const compactData = await SmartCatalog.findOne({
            $or: [
                { inventory: { $exists: true } },
                { page: 'compact' }
            ]
        }).lean();

        if (compactData) {
            const invObject = compactData.inventory || compactData;
            rawItems = invObject.best_inventory_items || invObject.explainable_procurement || [];
        }

        if (isSeller) {
            const allowedAsins = await getAllowedAsinsForSeller(req);
            rawItems = filterItemsBySellerPermission(rawItems, allowedAsins, req);
        }

        if (!rawItems || rawItems.length === 0) {
            return res.json({ enriched_items: [], status: 'ready' });
        }

        const enrichedItems = rawItems.map((item) => {
            const rawPrice = item.price_clean || item.price || item.Price || 0;
            let cleanPrice = typeof rawPrice === 'string' ? (parseFloat(rawPrice.replace(/[^0-9.-]+/g, '')) || 0) : (parseFloat(rawPrice) || 0);

            return {
                ...item,
                asin: item.asin || item.item_id?.toString() || 'N/A',
                title: item.title || 'Sản phẩm công nghệ',
                brand: item.brand || 'N/A',
                price: cleanPrice,
                predicted_rank: item.user_based_inventory_rank || item.predicted_rank || item.historical_rank || 999,
                predicted_user_count: item.predicted_user_count || item.historical_unique_users || 0,
                inventory_action: String(item.inventory_action || item.inventory_decision || 'monitor').toLowerCase().includes('high') ? 'priority_import_future_trend' : 'monitor', // Rút gọn logic mapping nhãn
                image_url: item.image_url || null
            };
        });

        res.json({ enriched_items: enrichedItems, status: 'ready' });
    } catch (error) {
        console.error('Lỗi đồng bộ dữ liệu nhập hàng:', error);
        res.status(500).json({ message: 'Lỗi Server' });
    }
};

/**
 * Lấy dữ liệu mục tiêu marketing.
 */
const getMarketingTargets = async (req, res) => {
    try {
        const compactData = await SmartCatalog.findOne({
            $or: [
                { marketing: { $exists: true } },
                { page: 'compact' }
            ]
        }).lean();

        if (!compactData) {
            return res.status(404).json({ message: 'Không tìm thấy dữ liệu marketing.' });
        }

        const baseData = compactData.marketing || compactData;
        let bestTargets = compactData.best_marketing_targets || baseData.best_marketing_targets || [];
        const allowedAsins = await getAllowedAsinsForSeller(req);

        bestTargets = filterItemsBySellerPermission(bestTargets, allowedAsins, req);

        res.json({
            ...baseData,
            best_marketing_targets: bestTargets,
            scenario_summary: compactData.scenario_summary || baseData.scenario_summary || [],
            status: 'ready'
        });
    } catch (error) {
        console.error('Lỗi đọc Marketing DB:', error);
        res.status(500).json({ message: 'Lỗi Server khi đọc dữ liệu marketing' });
    }
};

// =======================================================
// 4. PUBLIC / CUSTOMER AI DISCOVERY FUNCTIONS
// =======================================================

/**
 * Lấy dữ liệu hỗ trợ sản phẩm mới.
 */
const getNewProductSupport = async (req, res) => {
    try {
        const compactData = await SmartCatalog.findOne({
            $or: [
                { new_product_support: { $exists: true } },
                { page: 'compact' }
            ]
        }).lean();

        if (!compactData) {
            return res.status(404).json({ message: 'Không tìm thấy dữ liệu hỗ trợ sản phẩm mới.' });
        }

        const baseData = compactData.new_product_support || compactData;

        res.json({
            ...baseData,
            case7a_similar_or_replacement_product: compactData.case7a_similar_or_replacement_product || baseData.case7a_similar_or_replacement_product || {},
            case7b_completely_new_product: compactData.case7b_completely_new_product || baseData.case7b_completely_new_product || {},
            status: 'ready'
        });
    } catch (error) {
        console.error('Lỗi đọc New Product DB:', error);
        res.status(500).json({ message: 'Lỗi Server khi đọc dữ liệu hỗ trợ sản phẩm mới' });
    }
};

/**
 * Lấy danh mục thông minh Smart Catalog.
 */
const getSmartCatalog = async (req, res) => {
    try {
        const allData = await SmartCatalog.findOne({
            $or: [
                { page: 'compact' },
                { compare_history_vs_model: { $exists: true } }
            ]
        }).lean() || await SmartCatalog.findOne({}).lean();

        if (!allData) {
            return res.status(404).json({ message: 'Không tìm thấy dữ liệu Smart Catalog.' });
        }

        res.json({
            trending: allData.compare_history_vs_model?.future_trend_by_model || allData.trending || [],
            popular: allData.history?.items || allData.popular || [],
            recommended: allData.compare_history_vs_model?.stable_history_and_model || allData.recommended || [],
            status: 'ready'
        });
    } catch (error) {
        console.error('Lỗi đọc Catalog DB:', error);
        res.status(500).json({ message: 'Lỗi Server khi tải danh mục thông minh' });
    }
};

// =======================================================
// 5. ADMIN FUNCTIONS
// =======================================================

/**
 * Lấy dữ liệu dashboard quản trị AI.
 */
const getAiDashboardData = async (req, res) => {
    try {
        // 1. ĐỌC THAM SỐ TÌM KIẾM VÀ PHÂN TRANG TỪ PHÍA FRONTEND QUY ĐỊNH
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        // 2. XÂY DỰNG TIÊU CHÍ TÌM KIẾM ĐỐI TƯỢNG KHÁCH HÀNG (ROLE = 0)
        let userQuery = { role: 0 };
        if (search.trim() !== '') {
            userQuery.$and = [
                { role: 0 },
                {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { username: { $regex: search, $options: 'i' } },
                        { amazon_id: { $regex: search, $options: 'i' } }
                    ]
                }
            ];
        }

        // Thực hiện truy vấn song song để tối ưu hóa hiệu năng và tốc độ xử lý mạng
        const [users, totalUsers] = await Promise.all([
            User.find(userQuery).skip(skip).limit(limit).lean(),
            User.countDocuments(userQuery)
        ]);

        // 3. MAP MA TRẬN ĐỀ XUẤT AI (TOP 5 ITEMS) CHO TỪNG ĐỐI TƯỢNG KHÁCH HÀNG
        const userAnalytics = [];
        if (users.length > 0) {
            const userNumericIds = users.map(u => Number(u.username)).filter(id => !isNaN(id));

            // Chọc vào bộ nhớ lõi mẫu hình để rút mảng tương tác đề xuất
            const allRecs = await Recommendation.find({
                user_id: { $in: userNumericIds }
            }).lean();

            // Cache thông tin sản phẩm tương ứng giảm thiểu nghẽn băng thông database
            const allItemIds = [...new Set(allRecs.map(r => r.item_id).filter(Boolean))];
            const productsInDb = await Product.find({ item_id: { $in: allItemIds } })
                .select('item_id asin title price price_clean image_url_high image_url')
                .lean();

            for (const u of users) {
                const numericId = Number(u.username);
                const userRecs = allRecs
                    .filter(r => r.user_id === numericId)
                    .sort((a, b) => (a.rank || 0) - (b.rank || 0))
                    .slice(0, 5);

                const previewItems = userRecs.map(rec => {
                    const prod = productsInDb.find(p => Number(p.item_id) === Number(rec.item_id));
                    return {
                        asin: prod?.asin || 'N/A',
                        title: prod?.title || 'Sản phẩm thuật toán',
                        price: prod ? `$${prod.price_clean || prod.price || '0.00'}` : 'Liên hệ',
                        image: prod?.image_url_high || prod?.image_url || null
                    };
                });

                userAnalytics.push({
                    aiUserId: u.username || '0',
                    name: u.name || 'Người dùng hệ thống',
                    email: u.email || 'N/A',
                    amazonId: u.amazon_id || 'N/A',
                    previewItems: previewItems
                });
            }
        }

        // 4. LẤY DỮ LIỆU ĐỒ THỊ VÀ KIỂM ĐỊNH THUẬT TOÁN TỪ SMARTCATALOG (TAB 2)
        const compactData = await SmartCatalog.findOne({
            $or: [
                { dashboard: { $exists: true } },
                { page: 'compact' }
            ]
        }).lean();

        if (!compactData) {
            return res.status(404).json({ message: 'Không tìm thấy dữ liệu cấu hình ma trận AI.' });
        }

        const baseData = compactData.dashboard ? compactData.dashboard : compactData;
        const rawAblation = compactData.ablation_summary || baseData.ablation_summary || [];
        
        // Trích xuất danh sách thuật toán chạy trên phân vùng kiểm thử (Test Split)
        const scenariosSummary = rawAblation
            .filter(m => m.split === 'test')
            .sort((a, b) => (b.score || 0) - (a.score || 0));

        // 🌟 BƯỚC SỬA LỖI: TÍNH TOÁN TOP 50 SẢN PHẨM ĐƯỢC GỢI Ý TOÀN HỆ THỐNG
        const topRecsAggregate = await Recommendation.aggregate([
            { $group: { _id: '$item_id', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 50 } // Chỉ lấy Top 50 để tránh nặng Web
        ]);
        
        // Truy xuất thông tin ảnh, tên sản phẩm để đắp vào
        const topRecItemIds = topRecsAggregate.map(r => r._id);
        const topRecProducts = await Product.find({ item_id: { $in: topRecItemIds } })
            .select('item_id asin title image_url_high image_url')
            .lean();

        const globalTopProducts = topRecsAggregate.map(rec => {
            const prod = topRecProducts.find(p => Number(p.item_id) === Number(rec._id));
            return {
                asin: prod?.asin || 'N/A',
                title: prod?.title || `Sản phẩm AI phân tích (ID: ${rec._id})`,
                image: prod?.image_url_high || prod?.image_url || null,
                count: rec.count // Trả về số Hits khổng lồ thật sự
            };
        });

        // 5. KẾT XUẤT PHẢN HỒI HOÀN CHỈNH
        res.json({
            userAnalytics,
            scenariosSummary,
            globalTopProducts, // 🌟 TRUYỀN THÊM BIẾN NÀY XUỐNG FRONTEND
            
            ablation_summary: rawAblation,
            final_report: compactData.final_report || baseData.final_report || {},
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit)
            }
        });

    } catch (error) {
        console.error('Lỗi tích hợp dữ liệu Admin AI Analytics:', error);
        res.status(500).json({ message: 'Lỗi Server khi bốc tách dữ liệu ma trận thuật toán' });
    }
};
// =======================================================
// 6. EXPORT CONTROLLER FUNCTIONS
// Xuất các hàm để route sử dụng
// =======================================================

module.exports = {
    // System stats / BI cache
    getSystemStats,
    recalculateStats,

    // Seller + Admin AI business
    getTrendComparison,
    getInventoryAdvice,
    getMarketingTargets,

    // Public / Customer AI discovery
    getNewProductSupport,
    getSmartCatalog,

    // Admin
    getAiDashboardData
};