const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    asin: String,           
    item_id: Number,        
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
}, { collection: 'Products' }); 

module.exports = mongoose.model('Product', productSchema);