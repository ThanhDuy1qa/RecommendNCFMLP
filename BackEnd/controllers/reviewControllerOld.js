const Review = require('../models/ReviewOld');
const Product = require('../models/Product');

// Lấy lịch sử tương tác + Tên sản phẩm (Dùng DB Gốc)
const getReviewsByUser = async (req, res) => {
    try {
        const rawKeyword = req.params.userId.trim().toUpperCase();
        let reviews = await Review.find({ reviewerID: rawKeyword });
        
        if (reviews.length === 0) {
            reviews = await Review.find({ reviewerID: { $regex: '^' + rawKeyword } });
        }
        
        const itemIds = [...new Set(reviews.map(r => r.asin))];
        const products = await Product.find({ item_id: { $in: itemIds } }, 'item_id title');
        
        const productMap = {};
        products.forEach(p => { productMap[p.item_id] = p.title; });

        const formattedReviews = reviews.map(r => ({
            ...r._doc,
            productTitle: productMap[r.asin] || "Sản phẩm không xác định",
            overall: r.overall,
            reviewText: r.reviewText || "Không có nội dung"
        }));

        res.json(formattedReviews);
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// Lấy đánh giá cho trang chi tiết (Dùng DB Gốc)
const getReviewsByAsin = async (req, res) => {
    try {
        const { asin } = req.params;
        const reviews = await Review.find({ asin: asin });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};


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


module.exports = {
    getReviewsByAsin,
    getReviewerSuggestions,
    getReviewsByUser
};