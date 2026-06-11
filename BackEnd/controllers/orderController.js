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
    const orders = await Order.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Lỗi lấy lịch sử mua hàng:', error);
    res.status(500).json({
      message: 'Lỗi Server'
    });
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
    
    // 🌟 CHÌA KHÓA TỐC ĐỘ: Giới hạn chỉ lấy 50 đơn hàng mới nhất mỗi lần load
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; 
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      'items.sellerId': sellerId
    })
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)   // Bỏ qua các đơn cũ
      .limit(limit) // Chỉ lấy tối đa 50 đơn
      .lean();

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

    res.json(filteredOrders);
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

    // 🌟 TƯƠNG TỰ CHO ADMIN: Không thể load 340k đơn cùng lúc, chỉ load 50 đơn
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
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

    res.json(formattedOrders);
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