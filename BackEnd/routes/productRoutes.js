const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const uploadProductCloud = require('../config/cloudinaryProduct');// Đã thêm verifyToken vào đây
const { verifySeller, verifyToken } = require('../middleware/authMiddleware');

// 1. Gợi ý tìm kiếm
router.get('/seller/inventory-advice', verifyToken, productController.getInventoryAdvice);
router.get('/admin/scenario-summary', verifyToken, productController.getScenarioSummary);
router.get('/admin/ai-analytics', verifyToken, productController.getAdminAiAnalytics);
router.get('/suggest', productController.getSearchSuggestions);
router.get('/seller/top-sales', verifyToken, productController.getTopSellingProducts);
router.get('/detail/:id', productController.getProductById);
// 2. Lấy sản phẩm của Seller (Dùng verifyToken)
router.get('/my-products', verifyToken, productController.getMyProducts);
router.put('/update/:id', verifyToken, uploadProductCloud.single('image'), productController.updateProduct);
router.delete('/delete/:id', verifyToken, productController.deleteProduct);
// 3. Lấy danh mục
// 4. Thêm sản phẩm mới (Dành cho Admin/Seller, dùng verifySeller)
router.post('/add', verifyToken, uploadProductCloud.single('image'), productController.addProduct);
// 5. LẤY GỢI Ý AI
router.get('/recommendations/:reviewerId', productController.getAiRecommendations);

// 6. Lấy danh sách sản phẩm chung
router.get('/', productController.getProducts);

// 7. Lấy chi tiết 1 sản phẩm (BẮT BUỘC phải để dưới cùng)
router.get('/:asin', productController.getProductByAsin);

module.exports = router;