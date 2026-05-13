const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    // Dùng để liên kết với ID gốc của Amazon (ví dụ: AUITG1DJ3QUGK) trong file AI Parquet
    amazon_id: {
        type: String,
        default: null,
        index: true
    },
    // Quy định quyền hạn: 0 = Khách hàng, 1 = Người bán, 2 = Admin
    role: {
        type: Number,
        default: 0, 
        enum: [0, 1, 2] 
    },
    name: { type: String } 
        
    }, 
{ 
    timestamps: true // Tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('User', UserSchema);