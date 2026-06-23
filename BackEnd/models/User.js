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
    name: { type: String },
    phone: { 
        type: String, 
        default: '' 
    },
    address: { 
        type: String, 
        default: '' 
    },

    preferences: { 
    type: [String], // Lưu tên hoặc ID các danh mục (VD: ['Laptop', 'Điện thoại', 'Phụ kiện'])
    default: [] 
    },
    
    // 🌟 THÊM 2 TRƯỜNG NÀY CHO NGHIỆP VỤ TÀI CHÍNH
    walletBalance: { 
        type: Number, 
        default: 0 // Dùng để lưu tiền chờ rút của Seller
    },
    bankInfo: {
        bankName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        accountName: { type: String, default: '' }
    }

    
}, { 
    timestamps: true 
});

module.exports = mongoose.model('User', UserSchema);