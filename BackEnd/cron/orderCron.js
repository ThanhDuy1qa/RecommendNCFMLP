const cron = require('node-cron');
const Order = require('../models/Order');
const User = require('../models/User'); // Cần User để cộng tiền cho Seller

const startOrderCronJobs = () => {
  // Chạy lúc 00:00 mỗi ngày. Trong lúc test, bạn có thể để '* * * * *' (mỗi phút)
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 [CRON JOB] Bắt đầu rà soát tự động hoàn thành đơn hàng...');
    try {
      const now = new Date();
      
      // 1. Tính toán mốc thời gian 7 ngày trước
      // Khi test, bạn có thể đổi thành 5 phút: new Date(now.getTime() - (5 * 60 * 1000))
      const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      
      // 2. Tìm đơn hàng "Đang giao hàng" đã quá 7 ngày
      const overdueOrders = await Order.find({
        status: 'Đang giao hàng',
        updatedAt: { $lte: sevenDaysAgo },
        isPaidToSeller: { $ne: true } // Đảm bảo chưa chia tiền
      });

      let count = 0;

      for (const order of overdueOrders) {
        const sellerEarnings = {};
        let totalAdminCommission = 0; // 🌟 KHỞI TẠO BIẾN HOA HỒNG
        
        order.items.forEach(item => {
          if (item.sellerId) {
            const amount = item.price * item.quantity;
            sellerEarnings[item.sellerId] = (sellerEarnings[item.sellerId] || 0) + amount;
          }
        });

        for (const [sellerId, amount] of Object.entries(sellerEarnings)) {
          const platformFee = 0.05; 
          const finalAmount = amount * (1 - platformFee);
          const commissionAmount = amount * platformFee; // 🌟 TÍNH HOA HỒNG

          totalAdminCommission += commissionAmount; // 🌟 CỘNG DỒN

          await User.findByIdAndUpdate(sellerId, {
            $inc: { walletBalance: finalAmount } 
          });
        }

        // 🌟 CỘNG HOA HỒNG VÀO VÍ ADMIN
        if (totalAdminCommission > 0) {
          await User.findOneAndUpdate(
            { role: 2 },
            { $inc: { walletBalance: totalAdminCommission } }
          );
        }

        // Chốt đơn
        order.isPaidToSeller = true;
        order.status = 'Hoàn thành';
        await order.save();
        
        count++;
        console.log(`✅ [CRON] Tự động chốt đơn hàng quá 7 ngày: ${order._id}`);
      }

      if (count > 0) {
        console.log(`🎉 [CRON JOB] Đã tự động chốt thành công ${count} đơn hàng!`);
      }

    } catch (error) {
      console.error('❌ [CRON JOB] Lỗi quét tự động chốt đơn:', error);
    }
  });
};

module.exports = startOrderCronJobs;