const mongoose = require('mongoose');

const smartCatalogSchema = new mongoose.Schema({
    // (Để trống cũng được nếu dùng .lean() không ràng buộc)
}, { strict: false, collection: 'smart_catalog' }); // 🌟 Ép Mongoose trỏ đúng tên collection này!

module.exports = mongoose.model('SmartCatalog', smartCatalogSchema);