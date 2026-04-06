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
}, { collection: 'Electronics' }); 

module.exports = mongoose.model('Review', reviewSchema);