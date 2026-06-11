const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        asin: String,
        title: String,
        price: Number,
        image: String,
        quantity: Number,
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
    }],
    totalAmount: Number,
    shippingInfo: {
        fullName: { type: String, required: true },
        email: { type: String }, // 🌟 BỔ SUNG TRƯỜNG EMAIL
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    paymentMethod: { type: String, default: 'COD' },
    status: { type: String, default: 'Chờ xác nhận' } 
}, { timestamps: true });

// ==========================================
// 🌟 ĐÁNH INDEX (CHỈ MỤC) ĐỂ TĂNG TỐC ĐỘ TRUY VẤN
// ==========================================
orderSchema.index({ userId: 1 });               // Tăng tốc khi Khách hàng xem Lịch sử đơn hàng
orderSchema.index({ 'items.sellerId': 1 });     // Tăng tốc khi Người bán load Đơn hàng của tôi
orderSchema.index({ createdAt: -1 });           // Tăng tốc khi sắp xếp Đơn hàng mới nhất
orderSchema.index({ status: 1 });               // Tăng tốc khi Admin lọc đơn hàng theo Trạng thái

module.exports = mongoose.model('Order', orderSchema);