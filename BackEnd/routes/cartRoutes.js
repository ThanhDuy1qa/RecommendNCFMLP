const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, cartController.getCart);
router.post('/sync', verifyToken, cartController.syncCart);
router.post('/add', verifyToken, cartController.addToCart);
router.delete('/remove/:asin', verifyToken, cartController.removeFromCart);
router.delete('/clear', verifyToken, cartController.clearCart);

module.exports = router;