const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        asin: String,
        title: String,
        price: Number,
        image: String,
        quantity: Number,
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // BỔ SUNG DÒNG NÀY
    }],
    totalAmount: Number,
    shippingInfo: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    paymentMethod: { type: String, default: 'COD' },
    status: { type: String, default: 'Chờ xác nhận' } // Đổi mặc định thành Chờ xác nhận
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);