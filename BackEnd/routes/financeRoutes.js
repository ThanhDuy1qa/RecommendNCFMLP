const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { verifyToken } = require('../middleware/authMiddleware');

router.put('/bank', verifyToken, financeController.updateSellerBank);
router.post('/payout', verifyToken, financeController.requestPayout);
router.get('/seller', verifyToken, financeController.getSellerFinanceData);
router.put('/seller/bank', verifyToken, financeController.updateSellerBank);
router.post('/seller/payout', verifyToken, financeController.requestPayout);
router.get('/admin/payouts', verifyToken, financeController.getPendingPayouts);
router.put('/admin/payouts/:id/approve', verifyToken, financeController.approvePayout);
router.put('/admin/payouts/:id/reject', verifyToken, financeController.rejectPayout);
router.get('/admin/overview', verifyToken, financeController.getAdminFinanceOverview);
module.exports = router;