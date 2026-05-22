const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true, // Không cho phép tạo 2 danh mục trùng tên
        index: true 
    },
    image_url: { 
        type: String, 
        default: "" // Chỗ này Admin sẽ chèn link ảnh vào sau
    },
    description: { 
        type: String, 
        default: "" 
    },
    isActive: { 
        type: Boolean, 
        default: true // Dùng để ẩn/hiện danh mục (Ví dụ: Ẩn danh mục đồ Mùa Đông khi sang Mùa Hè)
    }
}, { 
    collection: 'categories', // Tên bảng trong MongoDB
    timestamps: true // Tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('Category', categorySchema);