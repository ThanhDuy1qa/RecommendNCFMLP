const mongoose = require('mongoose');

const InventoryAdviceSchema = new mongoose.Schema({
    scenario: String,
    item_id: Number, // ĐÃ SỬA: Đổi sang Number để khớp với file CSV gốc
    asin: String,    
    user_based_inventory_rank: Number,
    inventory_decision: String, 
    user_based_inventory_score: Number,
    predicted_user_count: Number,
    predicted_user_ratio: Number,
    title: String,
    brand: String,
    main_cat: String,
    price_clean: Number,
    image_url: String
});

module.exports = mongoose.model('InventoryAdvice', InventoryAdviceSchema);