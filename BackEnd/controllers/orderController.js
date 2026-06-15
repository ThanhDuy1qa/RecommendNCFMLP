const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

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
    const { items, totalAmount, shippingInfo, paymentMethod } = req.body;

    const itemsWithSeller = await Promise.all(
      items.map(async (item) => {
        const productInfo = await Product.findOne({ asin: item.asin });

        return {
          ...item,
          sellerId: productInfo ? productInfo.seller_id : null
        };
      })
    );

    const newOrder = await Order.create({
      userId: req.user.id,
      items: itemsWithSeller,
      totalAmount,
      shippingInfo,
      paymentMethod
    });

    res.status(201).json({
      message: 'Đặt hàng thành công!',
      order: newOrder
    });
  } catch (error) {
    console.error('Lỗi tạo đơn hàng:', error);
    res.status(500).json({
      message: 'Lỗi Server'
    });
  }
};

/**
 * Lấy lịch sử mua hàng của khách hàng hiện tại.
 * Chỉ trả về đơn hàng thuộc user đang đăng nhập.
 */
const getMyHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Khách hàng thường xem ít đơn 1 trang hơn Admin
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const status = req.query.status || '';
    const timeFilter = req.query.timeFilter || '';

    // Điều kiện mặc định: Chỉ lấy đơn của user này
    let query = { userId: req.user.id };

    // 1. Lọc theo trạng thái (Bỏ qua nếu chọn 'Tất cả')
    if (status && status !== 'Tất cả') {
      query.status = status;
    }

    // 2. Lọc theo thời gian bằng mốc cố định
    if (timeFilter) {
      const now = new Date();
      if (timeFilter === '30days') {
        query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 30)) };
      } else if (timeFilter === '6months') {
        query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 6)) };
      } else if (timeFilter === '2026') {
        query.createdAt = { $gte: new Date('2026-01-01'), $lte: new Date('2026-12-31T23:59:59') };
      } else if (timeFilter === '2025') {
        query.createdAt = { $gte: new Date('2025-01-01'), $lte: new Date('2025-12-31T23:59:59') };
      }
    }

    // 3. Tìm kiếm theo tên sản phẩm
    if (search) {
      query['items.title'] = { $regex: search.trim(), $options: 'i' };
    }

    // Đếm tổng số để phân trang (nếu sau này cần làm load more)
    const totalOrders = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Trả về dạng object thay vì array thuần để dễ mở rộng
    res.json({
      orders,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit)
    });
  } catch (error) {
    console.error('Lỗi lấy lịch sử mua hàng:', error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

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
    if (status) query.status = status;
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

      const myTotalAmount = myItems.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return sum + (price * quantity);
      }, 0);

      return {
        ...order,
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
/**
 * Cập nhật trạng thái đơn hàng.
 * Dùng cho seller xác nhận đơn, xử lý đơn, giao hàng...
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: 'Không tìm thấy đơn hàng!'
      });
    }

    res.json({
      message: 'Cập nhật thành công',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
    res.status(500).json({
      message: 'Lỗi Server khi cập nhật'
    });
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
      status: 'Chờ xác nhận'
    });

    res.json({ count });
  } catch (error) {
    console.error('Lỗi đếm đơn hàng chờ xác nhận:', error);
    res.status(500).json({
      message: 'Lỗi Server'
    });
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
// 4. EXPORT CONTROLLER FUNCTIONS
// Xuất các hàm để route sử dụng
// =======================================================

module.exports = {
  // Customer order
  createOrder,
  getMyHistory,

  // Seller order
  getSellerOrders,
  updateOrderStatus,
  getPendingCount,

  // Admin order
  getAllOrdersForAdmin
};