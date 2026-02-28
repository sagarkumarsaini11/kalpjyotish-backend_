// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder ,getOrder} = require('../controllers/orderController');

router.post('/create-order', createOrder);

router.get('/order/:id',getOrder);

module.exports = router;
