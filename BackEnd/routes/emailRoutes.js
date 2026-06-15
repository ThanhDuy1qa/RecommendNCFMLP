const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController'); 
const { verifyToken } = require('../middleware/authMiddleware');


router.post('/send-marketing-email', emailController.sendMarketingEmail);
router.post('/request-email-change', verifyToken, emailController.requestEmailChange);
router.post('/verify-email', emailController.verifyEmailChange);

module.exports = router;