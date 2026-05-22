const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware'); // Lính gác bảo mật

// Route cập nhật tên
router.put('/profile', verifyToken, userController.updateProfile);

// Route đổi mật khẩu
router.put('/change-password', verifyToken, userController.changePassword);

module.exports = router;