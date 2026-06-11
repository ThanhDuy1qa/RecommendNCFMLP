const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const uploadProductCloud = require('../config/cloudinaryProduct');// Đã thêm verifyToken vào đây
const { verifySeller, verifyToken } = require('../middleware/authMiddleware');

// 1. Gợi ý tìm kiếm
router.get('/suggest', productController.getSearchSuggestions);
router.get('/seller/top-sales', verifyToken, productController.getTopSellingProducts);
router.get('/detail/:id', productController.getProductById);
// 2. Lấy sản phẩm của Seller (Dùng verifyToken)
router.get('/my-products', verifyToken, productController.getMyProducts);
// 5. Các chức năng CRUD dành cho seller
router.put('/update/:id', verifyToken, uploadProductCloud.single('image'), productController.updateProduct);
router.delete('/delete/:id', verifyToken, productController.deleteProduct);
router.post('/add', verifyToken, uploadProductCloud.single('image'), productController.addProduct);
// 6. Gợi ý sản phẩm AI dành cho reviewer
router.get('/recommendations/:reviewerId', productController.getAiRecommendations);
// 7. Thống kê sản phẩm theo scenario dành cho admin
router.get('/admin/scenario-summary', verifyToken, productController.getScenarioSummary);
// 8. Tìm kiếm sản phẩm nâng cao dành cho admin
router.get('/', productController.getProducts);
// 9. Lấy sản phẩm theo ASIN (dành cho tất cả người dùng)
router.get('/:asin', productController.getProductByAsin);

module.exports = router;