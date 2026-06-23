const express = require('express');
const router = express.Router();
const sepayController = require('../controllers/sepayController');

router.post('/', sepayController.handlePaymentWebhook);
module.exports = router;