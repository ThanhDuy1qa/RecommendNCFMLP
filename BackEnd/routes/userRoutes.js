const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// ===============================
// Middleware kiểm tra Admin
// ===============================
const verifyAdminOnly = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && Number(req.user.role) === 2) {
      return next();
    }

    return res.status(403).json({
      message: 'Cảnh báo: Chỉ Admin mới có quyền thực hiện hành động này!'
    });
  });
};

router.get('/wallet-balance', verifyToken, userController.getWalletBalance);
// ===============================
// USER PROFILE
// ===============================

// Cập nhật tên hiển thị
router.put('/profile', verifyToken, userController.updateProfile);

// Đổi mật khẩu
router.put('/change-password', verifyToken, userController.changePassword);
router.put('/preferences', verifyToken, userController.savePreferences);

// ===============================
// ADMIN - QUẢN LÝ NGƯỜI DÙNG
// ===============================

// Lấy danh sách người dùng + thống kê role
router.get('/', verifyAdminOnly, userController.getAllUsers);

// Cập nhật quyền người dùng
router.put('/:id/role', verifyAdminOnly, userController.updateUserRole);

// Xóa người dùng
router.delete('/:id', verifyAdminOnly, userController.deleteUser);

// QUAN TRỌNG: phải export router trực tiếp
module.exports = router;