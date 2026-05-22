const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

// Lựa chọn 1: Dùng dữ liệu THẬT (Giao diện đẹp, đầy đủ tên sản phẩm)
const reviewController = require('../controllers/reviewController'); 

// Lựa chọn 2: Dùng dữ liệu SẠCH (Chuyên dùng để test AI/Cold Start)
//const reviewController = require('../controllers/reviewController');
router.get('/my-history', verifyToken, reviewController.getMyReviews);
// [API MỚI] Gợi ý tên khách hàng (Phải đặt TRÊN CÙNG)
router.get('/suggest', reviewController.getReviewerSuggestions);
// [API MỚI] Lấy lịch sử người dùng (Phải đặt TRÊN route /:asin để tránh bị nhầm)
router.get('/user/:userId', reviewController.getReviewsByUser);
// Phân luồng: Có người gọi API lấy đánh giá thì giao cho getReviewsByAsin xử lý
router.get('/:asin', reviewController.getReviewsByAsin);

router.post('/add', verifyToken, reviewController.addReview);

router.put('/update', verifyToken, reviewController.updateReview);

module.exports = router;