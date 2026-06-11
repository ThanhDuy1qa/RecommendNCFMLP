const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    overall: Number,
    verified: Boolean,
    reviewTime: String,
    
    // 1. ĐÁNH INDEX CHO REVIEWER ID (Mã chữ)
    reviewerID: { 
        type: String, 
        index: true 
    },
    
    // 2. KHAI BÁO THÊM VÀ ĐÁNH INDEX CHO USER_ID (Mã số AI)
    // Dù JSON gốc không có, nhưng phải khai báo để truy vấn $or không bị sập (COLLSCAN)
    user_id: { 
        type: String, 
        index: true 
    },

    asin: String,
    reviewerName: String,
    reviewText: String,
    summary: String,
    unixReviewTime: Number
}, { collection: 'Reviews' }); // Trỏ vào bảng gốc (ví dụ Electronics)

module.exports = mongoose.model('Review', reviewSchema);