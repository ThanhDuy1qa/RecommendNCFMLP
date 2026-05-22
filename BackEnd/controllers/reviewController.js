const Review = require('../models/Review');
const Product = require('../models/Product'); // Dùng để tra cứu tên sản phẩm
const User = require('../models/User');
const Order = require('../models/Order');
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

        // Thay vì dùng Aggregate cồng kềnh, dùng .find() cơ bản sẽ nhanh gấp 10 lần
        const suggestions = await Review.find({
            $or: [
                { reviewerID: { $regex: keyword, $options: 'i' } }, // Tìm theo mã chữ
                { user_id: { $regex: keyword, $options: 'i' } },    // Tìm theo mã số
                { reviewerName: { $regex: keyword, $options: 'i' } } // ĐÃ BỔ SUNG: Tìm theo Tên
            ]
        })
        .select('reviewerID user_id reviewerName') // Chỉ lấy 3 cột này cho nhẹ RAM
        .limit(30) // Lấy 30 cái rồi về tự lọc trùng
        .lean(); // Biến Mongoose Object thành JSON thuần để tăng tốc

        // BƯỚC LỌC TRÙNG BẰNG JAVASCRIPT (Nhanh hơn bắt Mongo gom nhóm)
        const uniqueUsers = [];
        const map = new Set();
        
        for (let doc of suggestions) {
            const id = doc.reviewerID || doc.user_id;
            if (id && !map.has(id)) {
                map.add(id);
                uniqueUsers.push({
                    reviewerID: id,
                    reviewerName: doc.reviewerName || "Khách hàng ẩn danh"
                });
            }
            if (uniqueUsers.length >= 5) break; // Chỉ trả về 5 người lên giao diện
        }

        res.json(uniqueUsers);
    } catch (error) {
        console.error("Lỗi lấy gợi ý người dùng:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};
// 3. Lấy toàn bộ lịch sử tương tác (Đã fix lỗi load 5 phút + Lấy tất cả)
const getReviewsByUser = async (req, res) => {
    try {
        const rawKeyword = req.params.userId.trim();

        // BƯỚC 1: Tìm Lịch sử - BỎ TÌM THEO TÊN Ở ĐÂY ĐỂ TRÁNH SẬP SERVER
        // (Chỉ tìm bằng reviewerID và user_id vì 2 cột này chắc chắn đã có Index)
        let reviews = await Review.find({ 
            $or: [
                { reviewerID: rawKeyword }, 
                { user_id: rawKeyword }
            ]
        })
        .sort({ unixReviewTime: -1 }) // Xếp mới nhất lên đầu
        .lean(); // Xóa .limit() ở đây để lấy TOÀN BỘ dữ liệu theo yêu cầu của bạn
        
        if (reviews.length === 0) {
            return res.json([]); 
        }
        
        // BƯỚC 2: Móc nối sang bảng Products để lấy Tiêu đề (Title)
        const itemIds = [...new Set(reviews.map(r => r.asin || r.item_id))];
        const products = await Product.find({ asin: { $in: itemIds } }, 'asin title');
        
        const productMap = {};
        products.forEach(p => {
            productMap[p.asin] = p.title;
        });

        // BƯỚC 3: Chuẩn hóa dữ liệu gửi về React
        const formattedReviews = reviews.map(doc => {
            return {
                ...doc,
                reviewerID: doc.reviewerID || doc.user_id,
                asin: doc.asin || doc.item_id,
                reviewerName: doc.reviewerName || "Khách hàng ẩn danh",
                overall: doc.overall || (doc.rating ? doc.rating * 5 : 5),
                reviewTime: doc.reviewTime || "N/A",
                summary: doc.summary || "Lịch sử tương tác",
                reviewText: doc.reviewText || "Dữ liệu tương tác đã được hệ thống AI ghi nhận.",
                productTitle: productMap[doc.asin || doc.item_id] || "Sản phẩm không xác định"
            };
        });

        res.json(formattedReviews);
    } catch (error) {
        console.error("Lỗi lấy lịch sử người dùng:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};
// Hàm lấy lịch sử đánh giá của CHÍNH NGƯỜI DÙNG dựa theo mã Token đăng nhập
const getMyReviews = async (req, res) => {
    try {
        // 1. Tìm thông tin User từ ID lưu trong Token mã hóa nghiệp vụ
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản người dùng!" });
        }

        // 2. Tạo tập hợp điều kiện quét chéo (Cả ID nội bộ lẫn mã định danh Amazon)
        const searchConditions = [{ user_id: req.user.id }];
        if (user.amazon_id) {
            searchConditions.push({ reviewerID: user.amazon_id });
            searchConditions.push({ user_id: user.amazon_id }); 
        }

        // 3. Quét bảng dữ liệu tương tác lịch sử trong MongoDB
        let reviews = await Review.find({ $or: searchConditions })
            .sort({ unixReviewTime: -1 }) // Sắp xếp đánh giá mới nhất lên đầu trang
            .lean();
        
        if (reviews.length === 0) {
            return res.json([]); 
        }
        
        // 4. Trích xuất danh sách ASIN để thực hiện kỹ thuật Hydration (Đổ đầy dữ liệu)
        const itemIds = [...new Set(reviews.map(r => r.asin || r.item_id))];
        const products = await Product.find({ asin: { $in: itemIds } }, 'asin title image_url_high image_url');
        
        const productMap = {};
        products.forEach(p => {
            productMap[p.asin] = {
                title: p.title,
                image: p.image_url_high || p.image_url
            };
        });

        // 5. Chuẩn hóa cấu trúc JSON thống nhất trả về ứng dụng React Client
        // 5. Chuẩn hóa cấu trúc JSON thống nhất trả về ứng dụng React Client (TRANG USER)
        const formattedReviews = reviews.map(doc => {
            const currentAsin = doc.asin || doc.item_id;
            const prodInfo = productMap[currentAsin]; // Bỏ || {} đi để nó có thể trả về undefined
            
            // ĐÃ BỔ SUNG: Nếu không tìm thấy info sản phẩm trong DB -> Bỏ qua bài review này luôn
            if (!prodInfo) return null; 
            
            return {
                ...doc,
                reviewerID: doc.reviewerID || doc.user_id,
                asin: currentAsin,
                reviewerName: doc.reviewerName || user.name || "Khách hàng ẩn danh",
                overall: doc.overall || (doc.rating ? doc.rating * 5 : 5),
                reviewTime: doc.reviewTime || (doc.unixReviewTime ? new Date(doc.unixReviewTime * 1000).toLocaleDateString('vi-VN') : "N/A"),
                summary: doc.summary || "Đánh giá sản phẩm",
                reviewText: doc.reviewText || "Dữ liệu tương tác đã được hệ thống AI ghi nhận.",
                productTitle: prodInfo.title, // Chắc chắn có title vì đã qua vòng if
                productImage: prodInfo.image || null
            };
        }).filter(item => item !== null); // ĐÃ BỔ SUNG: Lọc sạch các giá trị bị rỗng (null)

        res.json(formattedReviews);
    } catch (error) {
        console.error("Lỗi hệ thống khi lấy lịch sử tương tác cá nhân:", error);
        res.status(500).json({ message: "Lỗi Server khi tải lịch sử tương tác" });
    }
};

const addReview = async (req, res) => {
    try {
        const { asin, overall, summary, reviewText } = req.body;
        const userId = req.user.id; // Lấy từ Token

        // 1. Lấy thông tin User để lưu tên và ID
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" });

        // 2. NGHIỆP VỤ QUAN TRỌNG: Kiểm tra xem người này ĐÃ MUA và NHẬN HÀNG chưa?
        const hasBought = await Order.findOne({
            userId: userId,
            status: 'Hoàn thành', // Phải là đơn đã giao xong
            "items.asin": asin    // Đơn hàng phải chứa sản phẩm này
        });

        if (!hasBought) {
            return res.status(403).json({ message: "Bạn phải mua và nhận sản phẩm này mới được đánh giá!" });
        }

        // 3. Kiểm tra xem đã đánh giá sản phẩm này chưa (Trống spam)
        const existingReview = await Review.findOne({ user_id: userId, asin: asin });
        if (existingReview) {
            return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi!" });
        }

        // 4. Tạo bài đánh giá mới
        const newReview = new Review({
            reviewerID: user.amazon_id || user._id.toString(), // Dùng amazon_id nếu có, không thì dùng MongoID
            user_id: user._id.toString(), // Lưu vết ID gốc hệ thống
            asin: asin,
            reviewerName: user.name || user.username,
            overall: Number(overall),
            summary: summary,
            reviewText: reviewText,
            reviewTime: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, ' '), // Format chuẩn Amazon: "05 20, 2026"
            unixReviewTime: Math.floor(Date.now() / 1000),
            verified: true // Đóng dấu tích xanh "Hệ thống xác thực đã mua"
        });

        await newReview.save();
        res.status(201).json({ message: "Cảm ơn bạn đã đánh giá sản phẩm!", review: newReview });

    } catch (error) {
        console.error("Lỗi khi thêm đánh giá:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// [API MỚI] Cập nhật đánh giá đã tồn tại
const updateReview = async (req, res) => {
    try {
        const { asin, overall, summary, reviewText } = req.body;
        const userId = req.user.id; // Lấy từ Token người dùng đang đăng nhập

        // Tìm đúng bài đánh giá của user này cho sản phẩm này và cập nhật dữ liệu mới
        const updatedReview = await Review.findOneAndUpdate(
            { user_id: userId, asin: asin },
            {
                overall: Number(overall),
                summary: summary,
                reviewText: reviewText,
                // Cập nhật lại thời gian sửa đổi theo format chuẩn Amazon
                reviewTime: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, ' '),
                unixReviewTime: Math.floor(Date.now() / 1000)
            },
            { new: true } // Trả về dữ liệu mới sau khi sửa
        );

        if (!updatedReview) {
            return res.status(404).json({ message: "Không tìm thấy bài đánh giá phù hợp để chỉnh sửa!" });
        }

        res.json({ message: "Cập nhật đánh giá thành công!", review: updatedReview });
    } catch (error) {
        console.error("Lỗi khi cập nhật đánh giá:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi sửa đánh giá" });
    }
};
module.exports = {
    getReviewsByAsin,
    getReviewerSuggestions,
    getReviewsByUser,
    getMyReviews,
    addReview,
    updateReview
};