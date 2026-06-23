const cron = require('node-cron');
const Order = require('../models/Order');
const { sendOrderReminderEmail } = require('../controllers/emailController');

const startOrderCronJobs = () => {
  // 🌟 ĐÃ SỬA: Chạy mỗi 1 phút để test (Cú pháp: '* * * * *')
  cron.schedule('* * * * *', async () => {
    console.log('🔄 [CRON - TEST MODE] Bắt đầu quét hệ thống đơn hàng tự động...');
    try {
      const now = new Date();
      
      // 1. TÌM ĐƠN HÀNG ĐỂ NHẮC NHỞ (Qua 1 PHÚT, chưa thanh toán, chưa nhắc)
      const oneMinuteAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
      const ordersToRemind = await Order.find({
        status: 'Chờ xác nhận',
        paymentMethod: 'BANK_TRANSFER',
        createdAt: { $lte: oneMinuteAgo },
        reminderSent: false
      }).populate('userId', 'email'); 

      for (const order of ordersToRemind) {
        if (order.userId && order.userId.email) {
          const exchangeRate = 25000;
          const amountInVND = Math.round(order.totalAmount * exchangeRate);
          
          await sendOrderReminderEmail(order.userId.email, order._id.toString(), amountInVND);
          order.reminderSent = true;
          await order.save();
        }
      }

      // 2. TÌM ĐƠN HÀNG ĐỂ TỰ ĐỘNG HỦY (Qua 2 PHÚT, vẫn chưa thanh toán)
      const twoMinutesAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      const ordersToCancel = await Order.find({
        status: 'Chờ xác nhận',
        createdAt: { $lte: twoMinutesAgo }
      });

      for (const order of ordersToCancel) {
        order.status = 'Đã hủy';
        await order.save();
        console.log(`🛑 [CRON] Tự động hủy đơn hàng quá hạn 24 giờ: ${order._id}`);
      }

    } catch (error) {
      console.error('❌ [CRON] Lỗi quét đơn hàng:', error);
    }
  });
};

module.exports = startOrderCronJobs;