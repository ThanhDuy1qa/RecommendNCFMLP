const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware'); 

router.get('/admin/all-orders', verifyToken, orderController.getAllOrdersForAdmin);
// 1. Đếm đơn hàng chờ (Bắt buộc phải có verifyToken)
router.get('/pending-count', verifyToken, orderController.getPendingCount);

router.put('/cancel/:orderId', verifyToken, orderController.cancelOrder);

// 2. Lịch sử mua hàng của khách
router.get('/history', verifyToken, orderController.getMyHistory);

router.put('/update-items/:orderId', verifyToken, orderController.updateOrderItems);

// 3. Quản lý đơn hàng của Seller
router.get('/seller-orders', verifyToken, orderController.getSellerOrders);

router.put('/confirm-receipt/:orderId', verifyToken, orderController.confirmReceipt);

// 4. Tạo đơn hàng (Checkout)
router.post('/checkout', verifyToken, orderController.createOrder);

// 5. Cập nhật trạng thái đơn (Có gắn tham số :orderId nên đặt ở dưới cùng)
router.put('/update-status/:orderId', verifyToken, orderController.updateOrderStatus);

router.get('/admin/refunds', verifyToken, orderController.getRefundRequests)

router.put('/admin/confirm-refund/:orderId', verifyToken, orderController.confirmRefund);

router.get('/admin/exceptions', verifyToken, orderController.getExceptionOrders);
router.put('/admin/exceptions/:orderId/resolve', verifyToken, orderController.resolveException);

module.exports = router;