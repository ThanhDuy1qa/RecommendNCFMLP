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
        email: { type: String }, 
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    paymentMethod: { type: String, default: 'COD' },
    
    // 🌟 1. CHUẨN HÓA ENUM TRẠNG THÁI (Chặn rác dữ liệu)
    status: { 
        type: String, 
        enum: [
            'Chờ xác nhận', 'Đang xử lý', 'Đang giao hàng', 
            'Hoàn thành', 'Đã hủy', 'Thanh toán thiếu', 
            'Thanh toán thừa', 'Chờ hoàn tiền'
        ],
        default: 'Chờ xác nhận' 
    },

    // 🌟 2. CỜ ĐÁNH DẤU ĐÃ GỬI MAIL NHẮC NHỞ (Dành cho Cron Job)
    reminderSent: { type: Boolean, default: false },
    isPaidToSeller: { type: Boolean, default: false },

    bankTransactionId: { type: String, default: '' },
    paidAmountVND: { type: Number, default: 0 },

    // 🌟 3. NƠI LƯU THÔNG TIN KHÁCH YÊU CẦU HOÀN TIỀN KHI HỦY ĐƠN
    refundInfo: {
        bankName: String,
        accountNumber: String,
        accountName: String
    }

}, { timestamps: true });

// ==========================================
// 🌟 ĐÁNH INDEX (CHỈ MỤC) ĐỂ TĂNG TỐC ĐỘ TRUY VẤN
// ==========================================
orderSchema.index({ userId: 1 });               // Tăng tốc khi Khách hàng xem Lịch sử đơn hàng
orderSchema.index({ 'items.sellerId': 1 });     // Tăng tốc khi Người bán load Đơn hàng của tôi
orderSchema.index({ createdAt: -1 });           // Tăng tốc khi sắp xếp Đơn hàng mới nhất
orderSchema.index({ status: 1 });               // Tăng tốc khi Admin lọc đơn hàng theo Trạng thái
orderSchema.index({ status: 1, updatedAt: -1 }); // Tăng tốc khi Admin lọc và sắp xếp đơn hàng theo Trạng thái và Ngày cập nhật
module.exports = mongoose.model('Order', orderSchema);