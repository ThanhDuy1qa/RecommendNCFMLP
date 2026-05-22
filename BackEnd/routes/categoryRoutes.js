const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const uploadCloud = require('../config/cloudinary'); // Import cấu hình

// [GET] Lấy danh sách tất cả danh mục (Trang chủ gọi API này)
router.get('/', categoryController.getAllCategories);

// [POST] Thêm danh mục mới (Admin gọi API này)
router.post('/', uploadCloud.single('image'), categoryController.createCategory);

// [PUT] Sửa danh mục theo ID (Admin gọi API này)
router.put('/:id', uploadCloud.single('image'), categoryController.updateCategory);
// [DELETE] Xóa danh mục theo ID (Admin gọi API này)
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;