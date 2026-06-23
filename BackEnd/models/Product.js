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
    },
    status: { 
    type: String, 
    enum: ['Đang khảo sát', 'Đang bán', 'Ngừng kinh doanh'], 
    default: 'Đang bán' 
},
surveyStats: {
    totalResponses: { type: Number, default: 0 },
    positiveResponses: { type: Number, default: 0 }
}
    
}, { collection: 'Products' }); 

module.exports = mongoose.model('Product', productSchema);