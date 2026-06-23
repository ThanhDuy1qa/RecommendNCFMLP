const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đường dẫn: http://localhost:5000/api/auth/login
router.post('/login', authController.login);

router.post('/register', authController.register);

router.post('/verify-account', authController.verifyAccount);

router.post('/resend-verification', authController.resendVerificationEmail);
module.exports = router;