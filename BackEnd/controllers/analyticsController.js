const Product = require('../models/Product');
const Review = require('../models/Review');
const fs = require('fs'); 
const path = require('path'); 

// ==============================================================
// 1. CÁC HÀM XỬ LÝ ĐỘC LẬP (MODULES) - ĐÃ CẬP NHẬT THEO DATA MỚI
// ==============================================================

const fetchTotalProducts = () => Product.estimatedDocumentCount();
const fetchTotalReviews = () => Review.estimatedDocumentCount();

const fetchAvgRating = async () => {
    // Sửa overall -> rating
    const data = await Review.aggregate([{ $group: { _id: null, avgOverall: { $avg: "$rating" } } }]);
    // Nhân 5 để ra thang 5 sao
    return data.length > 0 ? (data[0].avgOverall * 5).toFixed(2) : "0.00";
};

const fetchTotalUsers = async () => {
    // Sửa reviewerID -> user_id
    const data = await Review.aggregate([
        { $group: { _id: "$user_id" } },
        { $count: "total" }
    ]).allowDiskUse(true);
    return data.length > 0 ? data[0].total : 0;
};

const fetchReviewsByTime = async () => {
    // Sửa unixReviewTime -> timestamp
    const data = await Review.aggregate([
        { $match: { timestamp: { $exists: true, $type: "number" } } },
        { 
            $group: { 
                _id: { 
                    year: { $year: { $toDate: { $multiply: ["$timestamp", 1000] } } },
                    month: { $month: { $toDate: { $multiply: ["$timestamp", 1000] } } },
                    day: { $dayOfMonth: { $toDate: { $multiply: ["$timestamp", 1000] } } }
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
    // Sửa overall -> rating
    const data = await Review.aggregate([
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: -1 } } 
    ]).allowDiskUse(true);
    // Nhận diện rating 0.2, 0.4... nhân 5 lên thành 1, 2, 3 Sao
    return data.map(item => ({ name: `${item._id * 5} Sao`, count: item.count }));
};

const fetchVerifiedPurchases = async () => {
    // Vì file clean.py đã lọc 100% verified = true, nên ta lấy tổng document luôn
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

// ==============================================================
// 2. HÀM CHẠY NỀN VÀ API ĐIỀU PHỐI (GIỮ NGUYÊN)
// ==============================================================
const CACHE_FILE_PATH = path.join(__dirname, '../stats_cache.json'); 
let cachedStats = null;
let isCalculating = false;

const runBackgroundAnalytics = async () => {
    isCalculating = true; 
    console.log("[HỆ THỐNG] Bắt đầu tính toán toàn bộ 7 Module phân tích ngầm...");

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
        console.log(`[HỆ THỐNG] 🎉 Đã tính xong 7 Module và lưu vào stats_cache.json!`);
    } catch (err) {
        console.error("[HỆ THỐNG] Lỗi khi chạy ngầm:", err);
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