// BackEnd/models/PendingUser.js
const mongoose = require('mongoose');

const PendingUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: Number, default: 0 },
    // 🌟 ĐÂY LÀ CHÌA KHÓA: Tự động xóa sau 24h (86400 giây)
    createdAt: { type: Date, default: Date.now, expires: 86400 } 
});

module.exports = mongoose.model('PendingUser', PendingUserSchema);