const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
    // Mã ID của khách hàng (Ví dụ: A0220159ZRNBTRKLG08H)
    reviewerID: {
        type: String,
        required: true,
        unique: true, // Đảm bảo mỗi khách hàng chỉ có 1 bản ghi gợi ý
        index: true   // Đánh chỉ mục để Node.js tìm kiếm siêu tốc
    },
    // Danh sách các mã ASIN sản phẩm (Ví dụ: ["B000SMZDIY", "B0002LHSG6", ...])
    recommendations: {
        type: [String],
        default: []
    },
    // Thời điểm cập nhật cuối cùng từ file Parquet (tự động mapping từ trường last_updated)
    last_updated: {
        type: Date,
        default: Date.now
    }
}, { 
    collection: 'Recommendations', // Khớp chính xác với tên Collection bạn đã tạo trong MongoDB
    timestamps: true 
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);