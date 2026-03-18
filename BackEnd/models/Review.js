const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    overall: Number,
    verified: Boolean,
    reviewTime: String,
    reviewerID: String,
    asin: String,
    reviewerName: String,
    reviewText: String,
    summary: String,
    style: Object,
    unixReviewTime: Number
}, { collection: 'Reviews' }); // Giả sử collection của bạn tên là 'Reviews'

module.exports = mongoose.model('Review', reviewSchema);