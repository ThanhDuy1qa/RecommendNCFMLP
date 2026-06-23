const User = require('../models/User');
const Payout = require('../models/Payout'); // File Payout.js bạn đã tạo ở bước trước
const Order = require('../models/Order'); // File Order.js bạn đã tạo ở bước trước
// Lấy thông tin Tài chính của Seller (Số dư, Ngân hàng, Lịch sử rút)
const getSellerFinanceData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const payoutHistory = await Payout.find({ sellerId: req.user.id }).sort({ createdAt: -1 });

    res.json({
      walletBalance: user.walletBalance,
      bankInfo: user.bankInfo,
      payoutHistory
    });
  } catch (error) {
    console.error("Lỗi lấy dữ liệu tài chính:", error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// Lưu thông tin Ngân hàng của Seller
const updateSellerBank = async (req, res) => {
  try {
    const { bankName, accountNumber, accountName } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bankInfo: { bankName, accountNumber, accountName } },
      { new: true }
    );

    res.json({ message: 'Cập nhật thành công', bankInfo: user.bankInfo });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// Gửi yêu cầu rút tiền
const requestPayout = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);

    if (amount < 10000) return res.status(400).json({ message: 'Tối thiểu rút 10.000đ' });
    if (amount > user.walletBalance) return res.status(400).json({ message: 'Số dư không đủ' });
    if (!user.bankInfo || !user.bankInfo.accountNumber) {
      return res.status(400).json({ message: 'Chưa thiết lập ngân hàng' });
    }

    // 1. Trừ tiền ví ảo
    user.walletBalance -= amount;
    await user.save();

    // 2. Tạo lệnh rút
    const newPayout = await Payout.create({
      sellerId: req.user.id,
      amount,
      bankInfo: user.bankInfo
    });

    res.json({ message: 'Gửi yêu cầu thành công', payout: newPayout });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// ==========================================
// CÁC HÀM DÀNH CHO ADMIN (KẾ TOÁN)
// ==========================================

// 1. Lấy danh sách Yêu cầu rút tiền đang chờ duyệt
const getPendingPayouts = async (req, res) => {
  try {
    if (req.user.role !== 2) return res.status(403).json({ message: 'Chỉ Admin mới có quyền!' });
    
    const payouts = await Payout.find({ status: 'Chờ duyệt' })
      .populate('sellerId', 'name email username')
      .sort({ createdAt: 1 }); // Ưu tiên người yêu cầu trước
      
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// 2. Admin duyệt: Đã chuyển tiền thành công
const approvePayout = async (req, res) => {
  try {
    if (req.user.role !== 2) return res.status(403).json({ message: 'Chỉ Admin mới có quyền!' });
    
    const payout = await Payout.findByIdAndUpdate(
      req.params.id, 
      { status: 'Đã chuyển' }, 
      { new: true }
    );
    res.json({ message: 'Đã xác nhận chuyển tiền cho Seller!', payout });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// 3. Admin từ chối: Hoàn lại tiền vào ví ảo cho Seller
const rejectPayout = async (req, res) => {
  try {
    if (req.user.role !== 2) return res.status(403).json({ message: 'Chỉ Admin mới có quyền!' });
    
    const payout = await Payout.findById(req.params.id);
    if (!payout || payout.status !== 'Chờ duyệt') return res.status(400).json({ message: 'Lệnh không hợp lệ' });

    // Cập nhật trạng thái
    payout.status = 'Từ chối';
    await payout.save();

    // Hoàn tiền lại vào ví của Seller
    await User.findByIdAndUpdate(payout.sellerId, {
      $inc: { walletBalance: payout.amount }
    });

    res.json({ message: 'Đã từ chối và hoàn tiền lại vào ví của Seller!', payout });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi Server' });
  }
};
const getAdminFinanceOverview = async (req, res) => {
  try {
    if (req.user.role !== 2) return res.status(403).json({ message: 'Chỉ Admin mới có quyền!' });

    // 🌟 THÊM LOGIC PHÂN TRANG Ở ĐÂY
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Mỗi lần load 20 đơn
    const skip = (page - 1) * limit;

    // 1. Tính TỔNG số liệu (Dùng Aggregation)
    const aggregationResult = await Order.aggregate([
      { $match: { status: { $in: ['Đang xử lý', 'Đang giao hàng', 'Đang giao', 'Hoàn thành'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          platformProfit: {
            $sum: {
              $cond: [{ $eq: ["$status", "Hoàn thành"] }, { $multiply: ["$totalAmount", 0.05] }, 0]
            }
          }
        }
      }
    ]);

    const stats = aggregationResult.length > 0 ? aggregationResult[0] : { totalRevenue: 0, platformProfit: 0 };

    // 2. Lấy CHI TIẾT có phân trang (Skip & Limit)
    const recentOrders = await Order.find({ status: 'Hoàn thành' })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email')
      .select('_id totalAmount updatedAt userId');

    // Đếm tổng số đơn hoàn thành để biết khi nào thì hết (ẩn nút Xem thêm)
    const totalCompleted = await Order.countDocuments({ status: 'Hoàn thành' });
    const hasMore = skip + recentOrders.length < totalCompleted;

    // 3. Trả về cả Tổng, Chi tiết và cờ hasMore
    res.json({ 
      totalRevenue: stats.totalRevenue, 
      platformProfit: stats.platformProfit,
      recentOrders: recentOrders,
      hasMore: hasMore // 🌟 TRẢ THÊM CỜ NÀY
    });

  } catch (error) {
    console.error("Lỗi tính doanh thu:", error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};
module.exports = {
  getSellerFinanceData,
  updateSellerBank,
  requestPayout,
  getPendingPayouts,
  approvePayout,
  rejectPayout,
  getAdminFinanceOverview
};