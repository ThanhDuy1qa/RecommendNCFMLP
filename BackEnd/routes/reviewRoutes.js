const express = require('express');
const router = express.Router();


// Nhập "anh đầu bếp" mảng Review vào
const reviewController = require('../controllers/reviewController');
// [API MỚI] Gợi ý tên khách hàng (Phải đặt TRÊN CÙNG)
router.get('/suggest', reviewController.getReviewerSuggestions);
// [API MỚI] Lấy lịch sử người dùng (Phải đặt TRÊN route /:asin để tránh bị nhầm)
router.get('/user/:userId', reviewController.getReviewsByUser);
// Phân luồng: Có người gọi API lấy đánh giá thì giao cho getReviewsByAsin xử lý
router.get('/:asin', reviewController.getReviewsByAsin);

module.exports = router;