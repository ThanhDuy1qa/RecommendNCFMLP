const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
// Chỉ import đúng Controller của phần Thống kê
const analyticsController = require('../controllers/analyticsController');

// Đăng ký đường dẫn: /stats
router.get('/stats', analyticsController.getSystemStats);
// Ép tính toán lại (API mới)
router.post('/recalculate', analyticsController.recalculateStats);
// API mới cho so sánh xu hướng
router.get('/compare', verifyToken, analyticsController.getTrendComparison);
// API mới cho lời khuyên nhập hàng
router.get('/inventory-advice', verifyToken, analyticsController.getInventoryAdvice);
// API mới cho mục tiêu marketing
router.get('/marketing-targets', verifyToken, analyticsController.getMarketingTargets);
// Thêm API cho Sản phẩm mới
router.get('/new-product', analyticsController.getNewProductSupport);
// Thêm Route cho Danh mục thông minh (End-User)
router.get('/smart-catalog', analyticsController.getSmartCatalog);
// Thêm Route cho Dashboard tổng hợp (Admin)
router.get('/dashboard', verifyToken, analyticsController.getAiDashboardData);

module.exports = router;