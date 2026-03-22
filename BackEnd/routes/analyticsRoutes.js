const express = require('express');
const router = express.Router();

// Chỉ import đúng Controller của phần Thống kê
const analyticsController = require('../controllers/analyticsController');

// Đăng ký đường dẫn: /stats
router.get('/stats', analyticsController.getSystemStats);

// Ép tính toán lại (API mới)
router.post('/recalculate', analyticsController.recalculateStats);

module.exports = router;