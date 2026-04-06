const Product = require('../models/Product');
const Review = require('../models/Review');
const fs = require('fs'); 
const path = require('path'); 

// ==============================================================
// 1. CÁC HÀM XỬ LÝ ĐỘC LẬP (MODULES)
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

// [MỚI] 1. Phân bố điểm số (1-5 sao)
const fetchRatingDistribution = async () => {
    const data = await Review.aggregate([
        { $group: { _id: "$overall", count: { $sum: 1 } } },
        { $sort: { _id: -1 } } // Sắp xếp từ 5 sao xuống 1 sao
    ]).allowDiskUse(true);
    return data.map(item => ({ name: `${item._id} Sao`, count: item.count }));
};

// [MỚI] 2. Tỷ lệ mua hàng xác thực
const fetchVerifiedPurchases = async () => {
    const data = await Review.aggregate([
        { $group: { _id: "$verified", count: { $sum: 1 } } }
    ]).allowDiskUse(true);
    return data.map(item => ({ name: item._id ? "Đã mua hàng (Verified)" : "Chưa xác thực", count: item.count }));
};

// [MỚI] 3. Top 10 Thương hiệu
const fetchTopBrands = async () => {
    const data = await Product.aggregate([
        { $match: { brand: { $ne: null, $ne: "" } } },
        { $group: { _id: "$brand", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 } // Chỉ lấy Top 10 cho đẹp biểu đồ
    ]);
    // Amazon hay có kiểu brand là "Visit Amazon's Apple Page", ta có thể làm sạch sơ qua nếu cần, ở đây giữ nguyên gốc
    return data.map(item => ({ name: item._id, count: item.count }));
};

// ==============================================================
// 2. HÀM CHẠY NỀN (BACKGROUND WORKER)
// ==============================================================

const CACHE_FILE_PATH = path.join(__dirname, '../stats_cache.json'); 
let cachedStats = null;
let isCalculating = false;

const runBackgroundAnalytics = async () => {
    isCalculating = true; 
    console.log("[HỆ THỐNG] Bắt đầu tính toán toàn bộ 7 Module phân tích ngầm...");

    try {
        console.log("[1/7] Đang tính điểm trung bình...");
        const avgRating = await fetchAvgRating();

        console.log("[2/7] Đang đếm lượng khách hàng độc lập...");
        const totalUsers = await fetchTotalUsers();

        console.log("[3/7] Đang phân tích biểu đồ thời gian...");
        const reviewsByTime = await fetchReviewsByTime();

        console.log("[4/7] Đang phân tích toàn bộ danh mục...");
        const allCategories = await fetchAllCategories();

        console.log("[5/7] Đang phân tích phân bố 1-5 sao...");
        const ratingDistribution = await fetchRatingDistribution();

        console.log("[6/7] Đang kiểm tra tỷ lệ xác thực mua hàng...");
        const verifiedPurchases = await fetchVerifiedPurchases();

        console.log("[7/7] Đang xếp hạng Top thương hiệu...");
        const topBrands = await fetchTopBrands();

        // Gộp toàn bộ vào 1 object
        cachedStats = {
            avgRating, totalUsers, reviewsByTime, allCategories, 
            ratingDistribution, verifiedPurchases, topBrands
        };

        fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cachedStats), 'utf-8');
        console.log(`[HỆ THỐNG] 🎉 Đã tính xong 7 Module và lưu vào stats_cache.json!`);
    } catch (err) {
        console.error("[HỆ THỐNG] Lỗi khi chạy ngầm:", err);
    } finally {
        isCalculating = false; 
    }
};

// ==============================================================
// 3. API ĐIỀU PHỐI (MAIN CONTROLLER)
// ==============================================================

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
        console.error("Lỗi Controller Thống kê:", error);
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
        console.error("Lỗi ép tính lại:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

module.exports = { getSystemStats, recalculateStats };