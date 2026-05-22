const mongoose = require('mongoose');

const TrainDataSchema = new mongoose.Schema({
    user: { type: Number, index: true }, 
    item: { type: Number, index: true }, 
    user_id: String, 
    item_id: String  
}, { 
    collection: 'full_interactions', // Trỏ chính xác vào bảng bạn vừa tạo
    timestamps: false 
});

module.exports = mongoose.model('TrainData', TrainDataSchema);