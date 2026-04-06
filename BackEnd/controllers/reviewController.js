const Review = require('../models/Review');

const getReviewsByAsin = async (req, res) => {
    try {
        const { asin } = req.params;
        const reviews = await Review.find({ asin: asin });
        res.json(reviews);
    } catch (error) {
        console.error("Lỗi lấy đánh giá:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

const getReviewerSuggestions = async (req, res) => {
    try {
        const keyword = req.query.q || "";
        if (!keyword) return res.json([]);

        // 1. Dọn dẹp ký tự lạ chống lỗi Regex
        const safeKeyword = keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

        // 2. Phân loại từ khóa: Có giống mã Reviewer ID không?
        // ID Amazon thường viết liền, không dấu cách, có chứa số.
        const isProbablyID = !keyword.includes(' ') && /[0-9]/.test(keyword);

        let suggestions = [];

        if (isProbablyID) {
            // ---- TRƯỜNG HỢP 1: TÌM THEO ID ----
            const idKeyword = safeKeyword.toUpperCase(); // Ép in hoa
            
            suggestions = await Review.aggregate([
                {
                    // Thêm ^ và KHÔNG dùng cờ 'i' để ép MongoDB dùng Index của ID
                    $match: { reviewerID: { $regex: '^' + idKeyword } }
                },
                { $limit: 100 }, // Dừng sớm
                {
                    $group: {
                        _id: "$reviewerID",
                        reviewerName: { $first: "$reviewerName" }
                    }
                },
                { $limit: 5 },
                {
                    $project: { reviewerID: "$_id", reviewerName: 1, _id: 0 }
                }
            ]);
        }

        // 3. Nếu tìm ID không ra (do khách gõ tên như "jojo", "john")
        if (suggestions.length === 0) {
            // ---- TRƯỜNG HỢP 2: TÌM THEO TÊN (MẸO 3 PHIÊN BẢN) ----
            const lowerK = safeKeyword.toLowerCase(); // jojo
            const capK = safeKeyword.charAt(0).toUpperCase() + safeKeyword.slice(1).toLowerCase(); // Jojo
            const upperK = safeKeyword.toUpperCase(); // JOJO

            suggestions = await Review.aggregate([
                {
                    // Tìm 1 trong 3 phiên bản, KHÔNG dùng cờ 'i' để cứu CPU
                    $match: {
                        $or: [
                            { reviewerName: { $regex: capK } },
                            { reviewerName: { $regex: lowerK } },
                            { reviewerName: { $regex: upperK } }
                        ]
                    }
                },
                { $limit: 100 }, // Dừng sớm
                {
                    $group: {
                        _id: "$reviewerID",
                        reviewerName: { $first: "$reviewerName" }
                    }
                },
                { $limit: 5 },
                {
                    $project: { reviewerID: "$_id", reviewerName: 1, _id: 0 }
                }
            ]);
        }

        res.json(suggestions);
    } catch (error) {
        console.error("Lỗi lấy gợi ý người dùng:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};
// [HÀM ĐÃ SỬA LUẬT] Tìm chính xác 1 người
const getReviewsByUser = async (req, res) => {
    try {
        const rawKeyword = req.params.userId.trim();
        const isID = !rawKeyword.includes(' ') && /[0-9]/.test(rawKeyword);

        let reviews = [];

        if (isID) {
            const keywordID = rawKeyword.toUpperCase();
            reviews = await Review.find({ reviewerID: keywordID });
            if (reviews.length === 0) {
                reviews = await Review.find({ reviewerID: { $regex: '^' + keywordID } });
            }
        } else {
            // ĐÃ SỬA: Tìm CHÍNH XÁC tên, không dùng $regex lấp liếm nữa
            reviews = await Review.find({ reviewerName: rawKeyword });
        }
        
        res.json(reviews);
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