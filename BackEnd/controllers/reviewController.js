const Review = require('../models/Review');
const Product = require('../models/Product'); // Dùng để tra cứu tên sản phẩm

// 1. Lấy đánh giá của 1 sản phẩm
const getReviewsByAsin = async (req, res) => {
    try {
        const { asin } = req.params;
        // Quét cả 2 trường hợp tên cột
        const reviews = await Review.find({ asin: asin });
        res.json(reviews);
    } catch (error) {
        console.error("Lỗi lấy đánh giá:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 2. Gợi ý tìm kiếm khi đang gõ chữ
const getReviewerSuggestions = async (req, res) => {
    try {
        const keyword = req.query.q || "";
        if (!keyword) return res.json([]);

        const safeKeyword = keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const idKeyword = safeKeyword.toUpperCase(); 

        const suggestions = await Review.aggregate([
            { 
                $match: { 
                    $or: [
                        { reviewerID: { $regex: '^' + idKeyword } },
                        { user_id: { $regex: '^' + idKeyword } }
                    ] 
                } 
            },
            { $limit: 100 },
            {
                $group: {
                    _id: { $ifNull: ["$reviewerID", "$user_id"] },
                    reviewerName: { $first: { $ifNull: ["$reviewerName", "ID Khách hàng"] } }
                }
            },
            { $limit: 5 },
            {
                $project: { reviewerID: "$_id", reviewerName: 1, _id: 0 }
            }
        ]);

        res.json(suggestions);
    } catch (error) {
        console.error("Lỗi lấy gợi ý người dùng:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 3. Lấy lịch sử tương tác của khách hàng + LẤY THÊM TÊN SẢN PHẨM
const getReviewsByUser = async (req, res) => {
    try {
        const rawKeyword = req.params.userId.trim().toUpperCase();

        // BƯỚC 1: Tìm lịch sử (Hỗ trợ cả Database gốc và Database Clean)
        let reviews = await Review.find({ 
            $or: [{ reviewerID: rawKeyword }, { user_id: rawKeyword }]
        });
        
        if (reviews.length === 0) {
            reviews = await Review.find({ 
                $or: [
                    { reviewerID: { $regex: '^' + rawKeyword } },
                    { user_id: { $regex: '^' + rawKeyword } }
                ]
            });
        }
        
        // BƯỚC 2: Móc nối sang bảng Products để lấy Tiêu đề (Title)
        const itemIds = [...new Set(reviews.map(r => r.asin || r.item_id))];
        const products = await Product.find({ item_id: { $in: itemIds } }, 'item_id title');
        
        const productMap = {};
        products.forEach(p => {
            productMap[p.item_id] = p.title;
        });

        // BƯỚC 3: Chuẩn hóa dữ liệu gửi về React
        const formattedReviews = reviews.map(r => {
            const doc = r._doc || r; // Hỗ trợ lấy data từ object Mongoose
            
            return {
                ...doc,
                // Đồng bộ tên biến cho React dễ đọc
                reviewerID: doc.reviewerID || doc.user_id,
                asin: doc.asin || doc.item_id,
                reviewerName: doc.reviewerName || "Khách hàng ẩn danh",
                overall: doc.overall || (doc.rating ? doc.rating * 5 : 5),
                reviewTime: doc.reviewTime || "N/A",
                summary: doc.summary || "Lịch sử tương tác",
                reviewText: doc.reviewText || "Dữ liệu tương tác đã được hệ thống AI ghi nhận.",
                // Gắn tên sản phẩm
                productTitle: productMap[doc.asin || doc.item_id] || "Sản phẩm không xác định"
            };
        });

        res.json(formattedReviews);
    } catch (error) {
        console.error("Lỗi lấy lịch sử người dùng:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

module.exports = {
    getReviewsByAsin,
    getReviewerSuggestions,
    getReviewsByUser
};