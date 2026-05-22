const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware'); 

router.get('/admin/all-orders', verifyToken, orderController.getAllOrdersForAdmin);
// 1. Đếm đơn hàng chờ (Bắt buộc phải có verifyToken)
router.get('/pending-count', verifyToken, orderController.getPendingCount);

// 2. Lịch sử mua hàng của khách
router.get('/history', verifyToken, orderController.getMyHistory);

// 3. Quản lý đơn hàng của Seller
router.get('/seller-orders', verifyToken, orderController.getSellerOrders);

// 4. Tạo đơn hàng (Checkout)
router.post('/checkout', verifyToken, orderController.createOrder);

// 5. Cập nhật trạng thái đơn (Có gắn tham số :orderId nên đặt ở dưới cùng)
router.put('/update-status/:orderId', verifyToken, orderController.updateOrderStatus);

module.exports = router;