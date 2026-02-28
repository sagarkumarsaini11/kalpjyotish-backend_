const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

// Add money to wallet
router.post('/add', walletController.addMoney);
router.post('/recharge/create-order', walletController.createRechargeOrder);
router.post('/recharge/verify', walletController.verifyRechargePayment);
router.get('/summary/:userId', walletController.getCreditSummary);
router.get('/all', walletController.getAllWallets);

// Get wallet by userId
router.get('/:userId', walletController.getWalletByUser);

module.exports = router;
