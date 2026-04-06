const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    asin: String,
    title: String,
    price: String,
    brand: String,
    imageURLHighRes: [String],
    imageURL: [String],
    category: [String],
    main_cat: String
}, { collection: 'meta_Electronics' });

module.exports = mongoose.model('Product', productSchema);