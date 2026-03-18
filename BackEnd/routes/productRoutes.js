const express = require('express');
const router = express.Router();

// Nhập "anh đầu bếp" (Controller) vào để giao việc
const productController = require('../controllers/productController');

// [API] Lấy danh sách toàn bộ danh mục (Phải đặt trên cùng)
router.get('/categories', productController.getCategories);

// [API MỚI] Gợi ý tìm kiếm (Autocomplete) - Phải đặt TRƯỚC /:asin
router.get('/suggest', productController.getSearchSuggestions);

// [API] Lấy danh sách sản phẩm có phân trang + TÌM KIẾM + LỌC DANH MỤC
router.get('/', productController.getProducts);

// [API] Lấy chi tiết 1 sản phẩm theo ASIN
router.get('/:asin', productController.getProductByAsin);

module.exports = router;