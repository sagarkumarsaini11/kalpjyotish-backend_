const express = require('express');
const router = express.Router();
const { addMoney, getMoneyByUser, getMoneyOptions } = require('../controllers/moneyAddController');

// POST - Add Money prototype
router.post('/add', addMoney);

// GET - Get available money add options
router.get('/options', getMoneyOptions);

// GET - Get user money add history by userId
router.get('/user/:userId', getMoneyByUser);

module.exports = router;
