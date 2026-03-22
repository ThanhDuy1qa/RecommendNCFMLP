const Product = require('../models/Product');

// 1. Hàm lấy danh sách toàn bộ danh mục
const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct("main_cat");
        const cleanCategories = categories.filter(cat => cat != null && cat !== "");
        res.json(cleanCategories);
    } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 2. Hàm lấy danh sách sản phẩm (có phân trang, tìm kiếm, lọc)
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 45;
        const search = req.query.search || ""; 
        
        const rawCategory = req.query.category || "";
        const category = decodeURIComponent(rawCategory); 

        const skip = (page - 1) * limit;

        let query = {};
        
        // Lọc theo chữ (Tìm kiếm)
        if (search) {
            if (search.length === 10 && !search.includes(' ')) {
                query.asin = search; 
            } else {
                query.title = { $regex: search, $options: 'i' }; 
            }
        }

        // Lọc theo Danh mục
        if (category) {
            const catNormal = category.replace(/&amp;/g, '&');
            const catWithAmp = catNormal.replace(/&/g, '&amp;'); 
            query.main_cat = { $in: [catNormal, catWithAmp] };
        }

        const products = await Product.find(query).skip(skip).limit(limit);

        const formattedProducts = products.map(prod => {
            let cleanPrice = "Liên hệ";
            if (prod.price && 
                !prod.price.includes('{') && 
                !prod.price.includes('margin') && 
                !prod.price.includes('<div') &&
                !prod.price.includes('<span')) {
                cleanPrice = prod.price;
            }

            let img = null;
            if (prod.imageURLHighRes && prod.imageURLHighRes.length > 0) {
                img = prod.imageURLHighRes[0];
            } else if (prod.imageURL && prod.imageURL.length > 0) {
                img = prod.imageURL[0];
            }

            return {
                asin: prod.asin,
                title: prod.title || "Chưa có tiêu đề",
                price: cleanPrice,
                brand: prod.brand || "N/A",
                image: img,
                category: prod.category && prod.category.length > 0 ? prod.category[prod.category.length - 1] : "Điện tử",
                main_cat: prod.main_cat || "Electronics"
            };
        });

        res.json(formattedProducts);
    } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 3. Hàm lấy chi tiết 1 sản phẩm theo ASIN
const getProductByAsin = async (req, res) => {
    try {
        const { asin } = req.params;
        const product = await Product.findOne({ asin: asin });

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        let cleanPrice = "Liên hệ";
        if (product.price && !product.price.includes('{') && !product.price.includes('margin')) {
            cleanPrice = product.price;
        }

        const productDetail = {
            ...product._doc,
            price: cleanPrice
        };

        res.json(productDetail);
    } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};
const getSearchSuggestions = async (req, res) => {
    try {
        const keyword = req.query.q || "";
        if (!keyword) return res.json([]);

        // Tìm tương đối theo tên hoặc mã ASIN
        const query = {
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { asin: { $regex: keyword, $options: 'i' } }
            ]
        };

        // Chỉ lấy 5 sản phẩm và chọn đúng 3 trường cần thiết cho nhẹ
        const suggestions = await Product.find(query)
            .select('title asin imageURLHighRes imageURL')
            .limit(5);

        const formattedSuggestions = suggestions.map(prod => {
            let img = null;
            if (prod.imageURLHighRes && prod.imageURLHighRes.length > 0) img = prod.imageURLHighRes[0];
            else if (prod.imageURL && prod.imageURL.length > 0) img = prod.imageURL[0];

            return {
                asin: prod.asin,
                title: prod.title || "Chưa có tiêu đề",
                image: img
            };
        });

        res.json(formattedSuggestions);
    } catch (error) {
        console.error("Lỗi lấy gợi ý:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// [HÀM ĐÃ TỐI ƯU SIÊU TỐC] Lấy thống kê tổng quan
// Biến toàn cục để lưu Cache
let cachedStats = null;
let isCalculating = false;

// [HÀM DATA ANALYTICS] Tính toán đa luồng các chỉ số phức tạp
const getSystemStats = async (req, res) => {
    try {
        const Product = require('../models/Product');
        const Review = require('../models/Review');

        const totalProducts = await Product.estimatedDocumentCount();
        const totalReviews = await Review.estimatedDocumentCount();

        if (!cachedStats && !isCalculating) {
            isCalculating = true; 
            console.log("[HỆ THỐNG] Đang tính toán CÁC BIỂU ĐỒ DATA lớn ngầm...");

            // Chạy song song 4 tác vụ cực nặng
            Promise.all([
                // 1. Tính điểm trung bình
                Review.aggregate([{ $group: { _id: null, avgOverall: { $avg: "$overall" } } }]),
                
                // 2. Đếm số lượng Khách hàng độc lập (Unique Users)
                Review.aggregate([
                    { $group: { _id: "$reviewerID" } },
                    { $count: "total" }
                ]).allowDiskUse(true), // Bắt buộc phải có để không tràn RAM

                // 3. Gom nhóm số lượng đánh giá theo Năm (Dùng unixReviewTime)
                Review.aggregate([
                    { $match: { unixReviewTime: { $exists: true, $type: "number" } } },
                    { 
                        $group: { 
                            _id: { $year: { $toDate: { $multiply: ["$unixReviewTime", 1000] } } }, 
                            count: { $sum: 1 } 
                        } 
                    },
                    { $sort: { _id: 1 } } // Sắp xếp năm tăng dần
                ]).allowDiskUse(true),

                // 4. Top 5 Danh mục sản phẩm lớn nhất
                Product.aggregate([
                    { $match: { main_cat: { $ne: null, $ne: "" } } },
                    { $group: { _id: "$main_cat", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 5 }
                ])
            ]).then(([avgData, usersData, yearData, catData]) => {
                // CHẠY NGẦM XONG -> LƯU VÀO CACHE
                const avgRating = avgData.length > 0 ? avgData[0].avgOverall.toFixed(2) : "0.00";
                const totalUsers = usersData.length > 0 ? usersData[0].total : 0;
                
                // Format lại data cho Biểu đồ Frontend dễ đọc
                const reviewsByYear = yearData.map(item => ({ year: item._id.toString(), count: item.count }));
                const topCategories = catData.map(item => ({ name: item._id, count: item.count }));

                cachedStats = {
                    totalProducts, totalReviews, avgRating, totalUsers, reviewsByYear, topCategories
                };
                isCalculating = false; 
                console.log(`[HỆ THỐNG] Đã tính xong toàn bộ Data Analytics!`);
            }).catch(error => {
                console.error("[HỆ THỐNG] Lỗi khi chạy ngầm Data Analytics:", error);
                isCalculating = false;
            });
        }

        // TRẢ VỀ KẾT QUẢ
        if (cachedStats) {
            res.json({ ...cachedStats, totalProducts, totalReviews, status: "ready" });
        } else {
            res.json({
                totalProducts, totalReviews, avgRating: "0.00", totalUsers: 0,
                reviewsByYear: [], topCategories: [], status: "calculating"
            });
        }
    } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// Xuất các hàm ra để file routes có thể sử dụng
module.exports = {
    getCategories,
    getProducts,
    getProductByAsin,
    getSearchSuggestions,
    getSystemStats 
};
