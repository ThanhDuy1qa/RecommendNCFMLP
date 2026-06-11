const Review = require('../models/Review');
const Product = require('../models/Product'); // Dùng để tra cứu tên sản phẩm
const User = require('../models/User');
const Order = require('../models/Order');
const mongoose = require('mongoose');
// 1. Lấy đánh giá của 1 sản phẩm
// BackEnd/controllers/analyticsController.js

// 1. Lấy đánh giá của 1 sản phẩm (Đã thêm Phân trang và fix JSON trả về)
const getReviewsByAsin = async (req, res) => {
    try {
        const { asin } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Xây dựng điều kiện tìm kiếm linh hoạt (Quét cả asin và item_id)
        const searchConditions = [{ asin: asin }];
        if (!isNaN(asin)) {
             searchConditions.push({ item_id: Number(asin) });
             searchConditions.push({ item_id: String(asin) });
        } else {
             searchConditions.push({ item_id: asin });
        }

        const query = { $or: searchConditions };

        // 🚀 TỐI ƯU: Sử dụng Promise.all để đếm tổng số và lấy dữ liệu CÙNG LÚC
        const [total, reviews] = await Promise.all([
            Review.countDocuments(query),
            Review.find(query)
                .sort({ unixReviewTime: -1 })
                .skip(skip)
                .limit(limit)
                .lean() // 🚀 TỐI ƯU: Thêm .lean() giúp Mongoose trả về plain JSON object, xử lý nhanh hơn rất nhiều so với Mongoose Document
        ]);

        // Cấu trúc response trả về (Giữ nguyên logic cũ của bạn)
        res.json({
            totalReviews: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            reviews: reviews
        });

    } catch (error) {
        console.error("Lỗi khi lấy đánh giá:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi tải đánh giá" });
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
// 3. Lấy toàn bộ lịch sử tương tác (Fix lỗi 500 CastError + Tận dụng Title nhúng + Quét đa ID)
const getReviewsByUser = async (req, res) => {
    try {
        const rawKeyword = req.params.userId.trim();

        // Bước 1: Tìm User hợp lệ
        let searchUserCond = [{ username: rawKeyword }, { amazon_id: rawKeyword }];
        if (mongoose.Types.ObjectId.isValid(rawKeyword)) {
            searchUserCond.push({ _id: rawKeyword });
        }
        const user = await User.findOne({ $or: searchUserCond });

        // Bước 2: Gom mọi loại ID của user này để quét bảng Review
        const searchConditions = [
            { reviewerID: rawKeyword }, 
            { user_id: rawKeyword }
        ];

        if (user) {
            // Quét thêm mã Amazon
            if (user.amazon_id) {
                searchConditions.push({ reviewerID: user.amazon_id });
                searchConditions.push({ user_id: user.amazon_id });
            }
            // Quét thêm mã Số AI (lưu trong username)
            if (user.username) {
                searchConditions.push({ user_id: user.username });
                if (!isNaN(user.username)) {
                    searchConditions.push({ user_id: Number(user.username) }); // Đảm bảo quét cả định dạng Number
                }
            }
        }

        let reviews = await Review.find({ $or: searchConditions })
            .sort({ unixReviewTime: -1 }) 
            .lean(); 
        
        if (reviews.length === 0) return res.json([]); 
        
        // Bước 3: Tìm Sản phẩm dự phòng (Quét ĐỒNG THỜI cột asin và item_id)
        const itemIds = [...new Set(reviews.map(r => r.asin || r.item_id))].filter(id => id != null);
        const numericItemIds = itemIds.filter(id => !isNaN(id)).map(Number); // Tách riêng các ID là số

        const products = await Product.find({ 
            $or: [
                { asin: { $in: itemIds } },
                { item_id: { $in: numericItemIds } }
            ]
        }, 'asin item_id title image_url_high image_url');

        // Tạo map hỗ trợ tra cứu bằng CẢ HAI loại ID
        const productMap = {};
        products.forEach(p => { 
            if (p.asin) productMap[p.asin] = { title: p.title, image: p.image_url_high || p.image_url }; 
            if (p.item_id) productMap[p.item_id] = { title: p.title, image: p.image_url_high || p.image_url }; 
        });

        // Bước 4: Format dữ liệu chuẩn xác
        const formattedReviews = reviews.map(doc => {
            const currentAsin = doc.asin || doc.item_id;
            const fallbackProd = productMap[currentAsin] || {};

            return {
                ...doc,
                reviewerID: doc.reviewerID || doc.user_id,
                asin: currentAsin,
                reviewerName: doc.reviewerName || user?.name || "Khách hàng ẩn danh",
                overall: doc.overall || (doc.rating ? doc.rating * 5 : 5),
                reviewTime: doc.reviewTime || (doc.unixReviewTime ? new Date(doc.unixReviewTime * 1000).toLocaleDateString('vi-VN') : "N/A"),
                summary: doc.summary || "Lịch sử tương tác",
                reviewText: doc.reviewText || "Dữ liệu tương tác đã được hệ thống AI ghi nhận.",
                productTitle: doc.title || fallbackProd.title || "Sản phẩm không xác định",
                productImage: doc.image_url || fallbackProd.image || null
            };
        });

        res.json(formattedReviews);
    } catch (error) {
        console.error("Lỗi lấy lịch sử người dùng:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 4. Hàm lấy lịch sử đánh giá của CHÍNH NGƯỜI DÙNG đang đăng nhập
const getMyReviews = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản người dùng!" });

        // 🌟 SỬA ĐIỂM CỐT LÕI: Tìm bằng user.username (Mã AI) thay vì req.user.id (Mã Mongo)
        const searchConditions = [{ user_id: user.username }];
        if (!isNaN(user.username)) {
            searchConditions.push({ user_id: Number(user.username) });
        }

        if (user.amazon_id) {
            searchConditions.push({ reviewerID: user.amazon_id });
            searchConditions.push({ user_id: user.amazon_id }); 
        }

        let reviews = await Review.find({ $or: searchConditions })
            .sort({ unixReviewTime: -1 })
            .lean();
        
        if (reviews.length === 0) return res.json([]); 
        
        // Tìm Sản phẩm dự phòng (Quét ĐỒNG THỜI cột asin và item_id)
        const itemIds = [...new Set(reviews.map(r => r.asin || r.item_id))].filter(id => id != null);
        const numericItemIds = itemIds.filter(id => !isNaN(id)).map(Number);

        const products = await Product.find({ 
            $or: [
                { asin: { $in: itemIds } },
                { item_id: { $in: numericItemIds } }
            ]
        }, 'asin item_id title image_url_high image_url');

        const productMap = {};
        products.forEach(p => {
            if (p.asin) productMap[p.asin] = { title: p.title, image: p.image_url_high || p.image_url };
            if (p.item_id) productMap[p.item_id] = { title: p.title, image: p.image_url_high || p.image_url };
        });

        const formattedReviews = reviews.map(doc => {
            const currentAsin = doc.asin || doc.item_id;
            const fallbackProd = productMap[currentAsin] || {};
            
            return {
                ...doc,
                reviewerID: doc.reviewerID || doc.user_id,
                asin: currentAsin,
                reviewerName: doc.reviewerName || user.name || "Khách hàng ẩn danh",
                overall: doc.overall || (doc.rating ? doc.rating * 5 : 5),
                reviewTime: doc.reviewTime || (doc.unixReviewTime ? new Date(doc.unixReviewTime * 1000).toLocaleDateString('vi-VN') : "N/A"),
                summary: doc.summary || "Đánh giá sản phẩm",
                reviewText: doc.reviewText || "Dữ liệu tương tác đã được hệ thống AI ghi nhận.",
                productTitle: doc.title || fallbackProd.title || "Sản phẩm đã ngừng kinh doanh",
                productImage: doc.image_url || fallbackProd.image || null
            };
        });

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