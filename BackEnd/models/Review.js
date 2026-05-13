const mongoose = require('mongoose');

const reviewOldSchema = new mongoose.Schema({
    overall: Number,
    verified: Boolean,
    reviewTime: String,
    reviewerID: String,
    asin: String,
    reviewerName: String,
    reviewText: String,
    summary: String,
    unixReviewTime: Number
}, { collection: 'Electronics' }); // Trỏ vào bảng gốc (ví dụ Electronics)

module.exports = mongoose.model('ReviewOld', reviewOldSchema);