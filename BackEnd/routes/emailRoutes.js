const express = require('express');
const router = express.Router();

// Import emailController mà bạn đã tạo ở bước trước
const emailController = require('../controllers/emailController'); 

// Khai báo đường dẫn API (Lưu ý dùng router.post)
router.post('/send-marketing-email', emailController.sendMarketingEmail);

module.exports = router;