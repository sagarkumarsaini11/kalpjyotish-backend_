const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/UserDetail');

// Razorpay instance
const razorpay = new Razorpay({
  key_id: 'rzp_live_E5OD8Hqnnuv2j5',
  key_secret: 'doil69i2489WGAWPcPLdXLbt'
});

// Create Order
const createOrder = async (req, res) => {
  try {
    const { productId, userId, amount, sessionId } = req.body;

    if (!productId || !userId || !amount || !sessionId) {
      return res.status(400).json({ message: 'Product ID, user ID, amount, and sessionId are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create order in Razorpay (amount in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    });

    // Generate a unique customProductId
    const customProductId = `CPID_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    // Save order in your DB
    const order = new Order({
      product: productId,
      user: userId,
      sessionId,
      razorpayOrderId: razorpayOrder.id,
      amount,
      status: 'PENDING',
      customProductId // <-- ensure uniqueness
    });

    await order.save();

    // Populate user and product in the response
    const populatedOrder = await Order.findById(order._id)
      .populate('product', 'name price description images')
      .populate('user', 'name email mobileNo');

    res.status(201).json({
      message: 'Order created successfully',
      data: populatedOrder,
      razorpayOrderId: razorpayOrder.id
    });

  } catch (error) {
    console.error('Create Order Error:', error.message || error);
    res.status(500).json({ message: 'Failed to create order', error: error.message || error });
  }
};

// Get order by MongoDB _id or Razorpay order ID
const getOrder = async (req, res) => {
  try {
    const { id } = req.params; // Can be MongoDB _id or Razorpay order ID

    // Try finding by MongoDB _id first
    let order = await Order.findById(id)
      .populate('product', 'name price description images')
      .populate('user', 'name email mobileNo');

    // If not found, try by Razorpay order ID
    if (!order) {
      order = await Order.findOne({ razorpayOrderId: id })
        .populate('product', 'name price description images')
        .populate('user', 'name email mobileNo');
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order fetched successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrder
};