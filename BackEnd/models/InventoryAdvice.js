// BackEnd/models/InventoryAdvice.js
const mongoose = require('mongoose');

// Định nghĩa Schema linh hoạt (strict: false) để thích ứng với mọi thuộc tính JSON vừa import
const InventoryAdviceSchema = new mongoose.Schema({}, { 
    strict: false, 
    collection: 'inventory_advice' // Trỏ chính xác tới tên collection của bạn trong MongoDB
});

module.exports = mongoose.model('InventoryAdvice', InventoryAdviceSchema);