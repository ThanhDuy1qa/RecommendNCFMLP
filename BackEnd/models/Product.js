const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    asin: String,            // MỚI: Mã chữ (VD: B00004SB92)
    item_id: Number,         // SỬA: Mã số AI (VD: 5178)
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
        default: null
    }
}, { collection: 'item_features' }); // File JSON khi import vào sẽ đè lên bảng này

module.exports = mongoose.model('Product', productSchema);