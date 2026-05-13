const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    item_id: String,
    title: String,
    price: Number,          
    brand: String,
    image_url_high: String, 
    image_url: String,      
    category: String,       
    main_cat: String,
    description: String,
    seller_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null // Tạm thời để null cho các sản phẩm cũ
    }
}, { collection: 'item_features' });

module.exports = mongoose.model('Product', productSchema);