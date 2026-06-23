const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendShippingEmail } = require('./emailController');
// =======================================================
// 1. CUSTOMER ORDER FUNCTIONS
// Các hàm dành cho khách hàng role 0
// =======================================================

/**
 * Tạo đơn hàng mới.
 * Khi khách đặt hàng, hệ thống tự quét từng sản phẩm trong giỏ
 * để tìm seller_id tương ứng và gắn sellerId vào từng item.
 */
const createOrder = async (req, res) => {
  try {
    // 🌟 KHÓA LỚP 2: CHẶN SELLER (ROLE 1) VÀ ADMIN (ROLE 2) ĐẶT HÀNG
    if (req.user && (req.user.role === 1 || req.user.role === 2)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Tài khoản Quản trị viên và Người bán không được phép đặt hàng!' 
      });
    }

    const { items, totalAmount, shippingInfo, paymentMethod, paymentMode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống!' });
    }

    if (!shippingInfo?.fullName || !shippingInfo?.phone || !shippingInfo?.address) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin giao hàng!' });
    }

    if (paymentMethod === 'BANK_TRANSFER') {
      return res.status(400).json({ success: false, message: 'Vui lòng thanh toán bằng Ví hoặc COD!' });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
    }

    const exchangeRate = 25000;
    let amountInVND = Math.round(totalAmount * exchangeRate);

    if (paymentMode === 'test_2k') {
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      amountInVND = totalQuantity * 2000;
    }

    if (paymentMethod === 'WALLET' && (currentUser.walletBalance || 0) < amountInVND) {
      return res.status(400).json({
        success: false,
        message: `Số dư ví không đủ! Đơn hàng: ${amountInVND.toLocaleString('vi-VN')}đ`
      });
    }

    const itemsWithSeller = await Promise.all(
      items.map(async (item) => {
        const productInfo = await Product.findOne({ asin: item.asin });
        return {
          ...item,
          sellerId: productInfo ? productInfo.seller_id : null
        };
      })
    );

    const initialStatus = 'Đang xử lý';

    const newOrder = await Order.create({
      userId: req.user.id,
      items: itemsWithSeller,
      totalAmount,
      shippingInfo,
      paymentMethod,
      status: initialStatus,
      paidAmountVND: amountInVND
    });

    if (paymentMethod === 'WALLET') {
      currentUser.walletBalance -= amountInVND;
      await currentUser.save();
    }

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      order: newOrder
    });
  } catch (error) {
    console.error('Lỗi tạo đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi Hệ thống không thể tạo đơn hàng'
    });
  }
};
/**
 * Lấy lịch sử mua hàng của khách hàng hiện tại.
 * Chỉ trả về đơn hàng thuộc user đang đăng nhập.
 */
/**
 * Lấy lịch sử mua hàng của khách hàng hiện tại.
 */
const getMyHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; 
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const status = req.query.status || '';
    const timeFilter = req.query.timeFilter || '';

    // Khởi tạo điều kiện truy vấn mặc định: Lấy đơn của user này
    let query = { userId: req.user.id };

    // 1. Lọc theo trạng thái
    if (status && status !== 'Tất cả') {
      query.status = status;
    }

    // 2. Lọc theo thời gian
    if (timeFilter) {
      const now = new Date();
      if (timeFilter === '30days') {
        query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 30)) };
      } else if (timeFilter === '6months') {
        query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 6)) };
      } else if (!isNaN(timeFilter)) { 
        const year = parseInt(timeFilter);
        query.createdAt = { 
          $gte: new Date(`${year}-01-01T00:00:00.000Z`), 
          $lte: new Date(`${year}-12-31T23:59:59.999Z`) 
        };
      }
    }

    // 3. Tối ưu thuật toán tìm kiếm (Tránh để Regex khóa CSDL)
    if (search) {
      const keyword = search.trim();
      query.$or = [
        { 'items.asin': keyword }, // Ưu tiên tìm mã ASIN chính xác (Tốc độ 1ms)
        { 'items.title': { $regex: keyword, $options: 'i' } } // Sau đó mới tìm theo Regex tên sản phẩm
      ];
    }

    // 🌟 GỘP 3 TÁC VỤ VÀO CHẠY SONG SONG ĐỂ TRIỆT TIÊU THỜI GIAN CHỜ
    const [totalOrders, orders, allDates] = await Promise.all([
      Order.countDocuments(query),                                // Tác vụ 1: Đếm tổng số
      Order.find(query)                                           // Tác vụ 2: Lấy dữ liệu 50 đơn
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.find({ userId: req.user.id }).select('createdAt').lean() // Tác vụ 3: Lấy ngày tháng làm bộ lọc Năm
    ]);

    // Xử lý nốt dữ liệu Năm sau khi DB đã trả về xong
    const availableYears = [...new Set(allDates.map(o => new Date(o.createdAt).getFullYear()))].sort((a, b) => b - a);

    res.json({
      orders,
      availableYears,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit)
    });
  } catch (error) {
    console.error('Lỗi lấy lịch sử mua hàng:', error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};


// 🌟 HÀM MỚI: CHỈNH SỬA SẢN PHẨM TRONG ĐƠN CHỜ XÁC NHẬN
const updateOrderItems = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items } = req.body; // Mảng items mới được Frontend gửi lên

    // 1. Tìm đơn hàng
    const order = await Order.findOne({ _id: orderId, userId: req.user.id });
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // 2. Chặn nếu đơn không phải là Chờ xác nhận
    if (order.status !== 'Chờ xác nhận') {
      return res.status(400).json({ message: 'Chỉ có thể sửa đơn hàng khi đang Chờ xác nhận!' });
    }

    // 3. Nếu người dùng xóa hết toàn bộ sản phẩm -> Tự động Hủy đơn luôn
    if (!items || items.length === 0) {
      order.status = 'Đã hủy';
      order.items = [];
      order.totalAmount = 0;
      await order.save();
      return res.json({ message: 'Đơn hàng đã được tự động hủy vì không còn sản phẩm nào', order });
    }

    // 4. Tính toán lại tổng tiền dựa trên số lượng mới
    const newTotalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 5. Cập nhật vào DB
    order.items = items;
    order.totalAmount = newTotalAmount;
    await order.save();

    res.json({ message: 'Cập nhật đơn hàng thành công!', order });

  } catch (error) {
    console.error('Lỗi cập nhật sản phẩm trong đơn:', error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};


// 🌟 HÀM MỚI: XỬ LÝ HỦY ĐƠN VÀ YÊU CẦU HOÀN TIỀN
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { refundInfo } = req.body;

    const order = await Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    if (['Đang giao hàng', 'Hoàn thành', 'Đã hủy', 'Chờ hoàn tiền'].includes(order.status)) {
      return res.status(400).json({ message: 'Đơn hàng này đang trong giai đoạn không thể hủy!' });
    }

    // 🌟 TỰ ĐỘNG HOÀN TIỀN VÀO VÍ NẾU THANH TOÁN BẰNG WALLET
  if (order.paymentMethod === 'WALLET') {
      const currentUser = await User.findById(req.user.id);
      
      // Lấy đúng số tiền khách đã thanh toán từ database.
      // Dùng công thức nhân tỷ giá làm phương án dự phòng (fallback) cho các đơn hàng cũ chưa có trường paidAmountVND.
      const refundAmount = order.paidAmountVND > 0 
          ? order.paidAmountVND 
          : Math.round(order.totalAmount * 25000);
      
      currentUser.walletBalance += refundAmount; // Cộng ngược lại đúng số tiền đã trả
      await currentUser.save();
      
      order.status = 'Đã hủy'; // Hủy luôn mà không cần chờ Admin duyệt
  }
    // XỬ LÝ CHUYỂN KHOẢN NGÂN HÀNG (Giữ nguyên như cũ)
    else if (order.paymentMethod === 'BANK_TRANSFER' && order.status !== 'Chờ xác nhận') {
      if (!refundInfo || !refundInfo.bankName || !refundInfo.accountNumber) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin hoàn tiền!' });
      }
      order.status = 'Chờ hoàn tiền';
      order.refundInfo = refundInfo;
    } else {
      order.status = 'Đã hủy';
    }

    await order.save();
    res.json({ message: 'Đã xử lý yêu cầu hủy đơn thành công!', order });

  } catch (error) {
    console.error('Lỗi hủy đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};
// ... Nhớ bổ sung cancelOrder vào module.exports ở cuối file nhé:
// module.exports = { ..., cancelOrder }

// ... Nhớ thêm updateOrderItems vào module.exports ở cuối file nhé!
// module.exports = { ..., updateOrderItems }
// =======================================================
// 2. SELLER ORDER FUNCTIONS
// Các hàm dành cho người bán role 1
// Admin role 2 cũng có thể dùng nếu route cho phép
// =======================================================

/**
 * Lấy danh sách đơn hàng của seller hiện tại.
 * Chỉ lấy các đơn có ít nhất một item thuộc seller đang đăng nhập,
 * VÀ CẮT BỎ các sản phẩm của cửa hàng khác, chỉ giữ lại sản phẩm của cửa hàng này.
 */
const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; 
    const skip = (page - 1) * limit;

    // Nhận params tìm kiếm và lọc
    const search = req.query.search || '';
    const status = req.query.status || '';
    const paymentMethod = req.query.paymentMethod || ''; 
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';

    // 🌟 ĐIỀU KIỆN CỐ ĐỊNH: Chỉ lấy đơn có chứa hàng của Seller này
    let query = { 'items.sellerId': sellerId };

    // 1. Lọc theo trạng thái và thanh toán
    if (status && status !== 'Chờ xác nhận') {
      // Nếu có lọc trạng thái (VD: Đang xử lý, Đang giao...)
      query.status = status;
    } else {
      // Nếu chọn "Tất cả" hoặc cố tình lọc "Chờ xác nhận" -> Ẩn sạch các đơn Chờ xác nhận
      query.status = { $ne: 'Chờ xác nhận' };
    }
    
    if (paymentMethod) query.paymentMethod = paymentMethod;

    // 2. Lọc theo thời gian (Đã fix lỗi Invalid Date)
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start)) query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end)) {
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }
    }

    // 3. Tìm kiếm Text
    if (search) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search.trim());
      
      if (isValidObjectId) {
        query.$or = [
          { _id: search.trim() },
          { userId: search.trim() }
        ];
      } else {
        query.$or = [
          { 'shippingInfo.fullName': { $regex: search.trim(), $options: 'i' } },
          { 'shippingInfo.phone': { $regex: search.trim(), $options: 'i' } },
          { 'items.asin': { $regex: search.trim(), $options: 'i' } },
          { 'items.title': { $regex: search.trim(), $options: 'i' } }
        ];
      }
    }

    // Đếm tổng số đơn thỏa mãn bộ lọc
    const totalOrders = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Lọc bỏ sản phẩm của shop khác, tính lại tổng tiền chỉ cho shop này
    const filteredOrders = orders.map((order) => {
      const myItems = order.items.filter(
        (item) => item.sellerId && item.sellerId.toString() === sellerId.toString()
      );
      const myTotalAmount = myItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // 🌟 ĐÁNH LỪA GIAO DIỆN SELLER: Nếu là Chờ hoàn tiền -> Hiển thị Đã hủy
      let displayStatus = order.status;
      if (order.status === 'Chờ hoàn tiền') {
        displayStatus = 'Đã hủy';
      }

      return {
        ...order,
        status: displayStatus, // 🌟 Trạng thái đã được bẻ lái
        items: myItems,
        totalAmount: myTotalAmount 
      };
    });

    // Trả về Object giống hệt Admin
    res.json({
      orders: filteredOrders,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit)
    });

  } catch (error) {
    console.error('Lỗi lấy đơn hàng của seller:', error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

const confirmReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    // Chỉ cho phép xác nhận khi đơn đang giao
    if (order.status !== 'Đang giao hàng' && order.status !== 'Đang giao') {
      return res.status(400).json({ message: 'Chỉ có thể xác nhận đơn đang giao hàng!' });
    }

    // NẾU CHƯA CỘNG TIỀN CHO SELLER THÌ MỚI LÀM
    if (!order.isPaidToSeller) {
      const sellerEarnings = {}; 
      let totalAdminCommission = 0; 
      
      const EXCHANGE_RATE = 25000; // 🌟 BƯỚC 1: KHAI BÁO TỶ GIÁ Ở ĐÂY

      order.items.forEach(item => {
        if (item.sellerId) {
          // 🌟 BƯỚC 2: NHÂN TỶ GIÁ ĐỂ BIẾN TIỀN ĐÔ THÀNH TIỀN VNĐ TRƯỚC KHI CỘNG
          const amountVND = Math.round((item.price * item.quantity) * EXCHANGE_RATE);
          sellerEarnings[item.sellerId] = (sellerEarnings[item.sellerId] || 0) + amountVND;
        }
      });

      // Lặp qua từng Seller để cộng tiền
      for (const [sellerId, amountVND] of Object.entries(sellerEarnings)) {
        const platformFee = 0.05; 
        
        // 🌟 BƯỚC 3: TÍNH PHÍ VÀ LỢI NHUẬN TRÊN SỐ TIỀN VNĐ ĐÃ QUY ĐỔI (Làm tròn để tránh số lẻ)
        const commissionAmount = Math.round(amountVND * platformFee); 
        const finalAmount = amountVND - commissionAmount; 

        totalAdminCommission += commissionAmount; 

        await User.findByIdAndUpdate(sellerId, {
          $inc: { walletBalance: finalAmount } 
        });
      }

      // Cộng tiền hoa hồng vào ví của ADMIN
      if (totalAdminCommission > 0) {
        await User.findOneAndUpdate(
          { role: 2 }, 
          { $inc: { walletBalance: totalAdminCommission } } 
        );
      }

      order.isPaidToSeller = true; 
    }

    order.status = 'Hoàn thành';
    await order.save();

    res.json({ message: 'Cảm ơn bạn đã xác nhận! Đơn hàng đã hoàn thành và tiền (VNĐ) đã được chuyển cho người bán.', order });
  } catch (error) {
    console.error('Lỗi xác nhận nhận hàng:', error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};
/**
 * Cập nhật trạng thái đơn hàng.
 * Dùng cho seller xác nhận đơn, xử lý đơn, giao hàng...
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // 🌟 KHÓA LỚP 1: CHẶN SELLER TỰ Ý BẤM "HOÀN THÀNH"
    if (req.user.role === 1 && status === 'Hoàn thành') {
      return res.status(403).json({
        message: 'Lỗi nghiệp vụ: Chỉ có Khách hàng (bấm Đã nhận hàng) hoặc Hệ thống mới được quyền chuyển đơn sang Hoàn thành!'
      });
    }

    // Tìm đơn hàng hiện tại (Populate luôn email người mua để tí nữa gửi mail)
    const order = await Order.findById(orderId).populate('userId', 'email');
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });
    }

    const oldStatus = order.status;
    
    // Cập nhật trạng thái
    order.status = status;
    const updatedOrder = await order.save();

    // 🌟 KÍCH HOẠT GỬI MAIL: Nếu đổi từ trạng thái khác sang "Đang giao hàng" hoặc "Đang giao"
    if (
      (status === 'Đang giao hàng' || status === 'Đang giao') && 
      (oldStatus !== 'Đang giao hàng' && oldStatus !== 'Đang giao')
    ) {
      if (order.userId && order.userId.email) {
        // Gửi mail ngầm (Không cần await để phản hồi API nhanh hơn)
        sendShippingEmail(order.userId.email, order._id.toString());
      }
    }

    res.json({
      message: 'Cập nhật trạng thái thành công!',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi Server khi cập nhật' });
  }
};

/**
 * Đếm số đơn hàng đang chờ xác nhận của seller hiện tại.
 * Dùng để hiện badge thông báo trên giao diện seller.
 */
const getPendingCount = async (req, res) => {
  try {
    const count = await Order.countDocuments({
      'items.sellerId': req.user.id,
      status: 'Đang xử lý' // 🌟 Sửa dòng này
    });

    res.json({ count });
  } catch (error) {
    console.error('Lỗi đếm đơn hàng chờ xác nhận:', error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// =======================================================
// 3. ADMIN ORDER FUNCTIONS
// Các hàm dành riêng cho admin role 2
// =======================================================

/**
 * Admin lấy toàn bộ đơn hàng trong hệ thống.
 * Đồng thời gắn thêm sellerName vào từng item trong đơn hàng
 * để admin biết sản phẩm đó thuộc seller nào.
 */
const getAllOrdersForAdmin = async (req, res) => {
  try {
    if (req.user.role !== 2) {
      return res.status(403).json({ message: 'Truy cập bị từ chối. Chỉ Admin mới có quyền này!' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    // Nhận thêm các tham số mới
    const search = req.query.search || '';
    const status = req.query.status || '';
    const paymentMethod = req.query.paymentMethod || ''; 
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';
    
    const skip = (page - 1) * limit;

    // 🌟 KHỞI TẠO BỘ LỌC TÌM KIẾM
    let query = {};

    // 1. Lọc theo trạng thái 
    if (status) query.status = status;

    // 2. Lọc theo phương thức thanh toán (MỚI)
    if (paymentMethod) query.paymentMethod = paymentMethod;

    // 3. Lọc theo khoảng thời gian (MỚI)
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Kéo dài đến cuối ngày
        query.createdAt.$lte = end;
      }
    }

    // 4. Mở rộng tìm kiếm từ khóa (MỚI: Thêm ASIN và Tên sản phẩm)
    if (search) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search.trim());
      
      if (isValidObjectId) {
        // Mở rộng: Nếu gõ ID, có thể là tra ID đơn hoặc tra ID của User mua
        query.$or = [
          { _id: search.trim() },
          { userId: search.trim() }
        ];
      } else {
        query.$or = [
          { 'shippingInfo.fullName': { $regex: search.trim(), $options: 'i' } },
          { 'shippingInfo.phone': { $regex: search.trim(), $options: 'i' } },
          { 'items.asin': { $regex: search.trim(), $options: 'i' } },  // Tra theo mã sản phẩm
          { 'items.title': { $regex: search.trim(), $options: 'i' } } // Tra theo tên sản phẩm
        ];
      }
    }

    const totalOrders = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const sellerIds = [];

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.sellerId && !sellerIds.includes(item.sellerId)) {
          sellerIds.push(item.sellerId);
        }
      });
    });

    const sellers = await User.find(
      { _id: { $in: sellerIds } },
      'name username'
    );

    const sellerMap = {};

    sellers.forEach((seller) => {
      sellerMap[seller._id.toString()] = seller.name || seller.username || 'Người bán ẩn danh';
    });

    const formattedOrders = orders.map((order) => {
      const newItems = order.items.map((item) => ({
        ...item,
        sellerName: item.sellerId
          ? sellerMap[item.sellerId.toString()] || 'Không xác định'
          : 'Cửa hàng gốc'
      }));

      return {
        ...order,
        items: newItems
      };
    });

    res.json({
        orders: formattedOrders,
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit)
    });
  } catch (error) {
    console.error('Lỗi lấy tất cả đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};


// =======================================================
// 4. FINANCE & ACCOUNTING FUNCTIONS (Dành cho Kế toán / Admin)
// =======================================================

// Lấy danh sách các đơn hàng đang chờ hoàn tiền
const getRefundRequests = async (req, res) => {
  try {
    // Chỉ Admin hoặc Kế toán mới được xem
    if (req.user.role !== 2) {
      return res.status(403).json({ message: 'Từ chối truy cập!' });
    }

    const refundOrders = await Order.find({ status: 'Chờ hoàn tiền' })
      .populate('userId', 'email')
      .sort({ updatedAt: -1 }); // Ưu tiên xử lý đơn mới yêu cầu trước

    res.status(200).json(refundOrders);
  } catch (error) {
    console.error('Lỗi lấy danh sách hoàn tiền:', error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// Xác nhận Kế toán đã chuyển khoản trả khách thành công
const confirmRefund = async (req, res) => {
  try {
    if (req.user.role !== 2) {
      return res.status(403).json({ message: 'Từ chối truy cập!' });
    }

    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order || order.status !== 'Chờ hoàn tiền') {
      return res.status(400).json({ message: 'Đơn hàng không hợp lệ hoặc đã được xử lý!' });
    }

    // 🌟 Chốt đơn: Cập nhật cờ đã hoàn tiền và đổi trạng thái thành Đã hủy
    if  (order.refundInfo) {
      order.refundInfo.isRefunded = true;
    }
    order.status = 'Đã hủy';
    
    await order.save();
    res.json({ message: 'Đã xác nhận hoàn tiền và đóng đơn hàng thành công!', order });

  } catch (error) {
    console.error('Lỗi xác nhận hoàn tiền:', error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// Lấy danh sách các đơn hàng có vấn đề về dòng tiền (Mua thừa/thiếu, Hoàn thừa/thiếu)
const getExceptionOrders = async (req, res) => {
  try {
    if (req.user.role !== 2) return res.status(403).json({ message: 'Từ chối truy cập!' });

    const exceptions = await Order.find({ 
      status: { $in: ['Thanh toán thiếu', 'Thanh toán thừa', 'Hoàn tiền thiếu', 'Hoàn tiền thừa'] } 
    }).populate('userId', 'email').sort({ updatedAt: -1 });

    res.status(200).json(exceptions);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// Kế toán ra quyết định: Duyệt ép hoặc Hủy đơn
const resolveException = async (req, res) => {
  try {
    if (req.user.role !== 2) return res.status(403).json({ message: 'Từ chối truy cập!' });

    const { orderId } = req.params;
    const { action } = req.body; // 'approve' (Duyệt ép) hoặc 'cancel' (Hủy bỏ)
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn!' });

    if (action === 'approve') {
      if (['Hoàn tiền thiếu', 'Hoàn tiền thừa'].includes(order.status)) {
        order.status = 'Đã hủy'; // Chốt sổ hoàn tiền
        if (order.refundInfo) order.refundInfo.isRefunded = true;
      } else {
        order.status = 'Đang xử lý'; // Chốt sổ thanh toán mua hàng
      }
    } else if (action === 'cancel') {
      order.status = 'Chờ hoàn tiền'; // Đẩy lại về tab chờ hoàn tiền để làm lại
    }
    
    await order.save();
    res.json({ message: 'Đã xử lý ngoại lệ thành công!', order });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// 🌟 HÀM MỚI: KHÁCH HÀNG BÁO CÁO CHƯA NHẬN ĐƯỢC HÀNG
const reportNotReceived = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    // Chỉ cho khiếu nại khi đang giao hoặc vừa giao xong
    if (!['Đang giao hàng', 'Đang giao'].includes(order.status)) {
      return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ để khiếu nại!' });
    }

    // Đổi sang trạng thái đóng băng
    order.status = 'Đang khiếu nại';
    await order.save();

    res.json({ message: 'Đã ghi nhận khiếu nại! Admin sẽ tạm giữ tiền và liên hệ với bạn để giải quyết.', order });
  } catch (error) {
    console.error('Lỗi khiếu nại:', error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// Nhớ kéo xuống module.exports thêm reportNotReceived vào nhé!

module.exports = {
  // Customer order
  createOrder,
  getMyHistory,
  updateOrderItems, 
  cancelOrder,
  // Seller order
  getSellerOrders,
  updateOrderStatus,
  getPendingCount,
  confirmReceipt,

  // Admin order
  getAllOrdersForAdmin,
  // Finance & Accounting
  getRefundRequests,
  confirmRefund,
  getExceptionOrders,
  resolveException,
  reportNotReceived
};