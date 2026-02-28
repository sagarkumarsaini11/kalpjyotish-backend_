const Wallet = require('../models/Wallet');
const User = require('../models/UserDetail');
const Transaction = require("../models/Transaction");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_SJaaJpfj9dWo0X",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "nBpNaNFLN2aJ1yI9ALt5D0Oi",
});

// 👉 Add Money to Wallet
exports.addMoney = async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: 'UserId and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    // check user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // find or create wallet
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId, balance: 0 });
    }

    wallet.balance += amount;
    wallet.transactions.push({ type: 'credit', amount, reason: reason || 'Wallet Top-up' });

    await wallet.save();

    return res.status(200).json({
      success: true,
      message: 'Money added successfully',
      wallet
    });
  } catch (err) {
    console.error('Add Money error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// 👉 Get Wallet by UserId
exports.getWalletByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const wallet = await Wallet.findOne({ user: userId }).populate('user');
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found for this user' });
    }

    return res.status(200).json({ success: true, wallet });
  } catch (err) {
    console.error('Get Wallet error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// 👉 Get All Wallets (Admin)
exports.getAllWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find().populate('user');
    return res.status(200).json({ success: true, wallets });
  } catch (err) {
    console.error('Get All Wallets error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getCreditSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("wallet freeMinutesRemaining");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        walletBalance: Number(user.wallet?.balance || 0),
        currency: user.wallet?.currency || "INR",
        freeMinutesRemaining: Number(user.freeMinutesRemaining || 0),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

exports.createRechargeOrder = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: "userId and amount are required" });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const user = await User.findById(userId).select("name email mobileNo");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: "Razorpay keys are not configured" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(numericAmount * 100),
      currency: "INR",
      receipt: `wallet_${userId}_${Date.now()}`.slice(0, 40),
      payment_capture: 1,
    });

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: numericAmount,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
        user: {
          name: user.name || "User",
          email: user.email || "",
          contact: user.mobileNo || "",
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create recharge order", error: err.message });
  }
};

exports.verifyRechargePayment = async (req, res) => {
  try {
    const {
      userId,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!userId || !amount || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification fields" });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(payload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const duplicate = await Transaction.findOne({
      userId,
      type: "credit",
      reason: `Razorpay:${razorpay_payment_id}`,
    });
    if (duplicate) {
      const user = await User.findById(userId).select("wallet freeMinutesRemaining");
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: {
          walletBalance: Number(user?.wallet?.balance || 0),
          freeMinutesRemaining: Number(user?.freeMinutesRemaining || 0),
        },
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.wallet = user.wallet || { balance: 0, currency: "INR" };
    user.wallet.balance = Number(user.wallet.balance || 0) + Number(amount);
    await user.save();

    await Transaction.create({
      userId,
      type: "credit",
      amount: Number(amount),
      reason: `Razorpay:${razorpay_payment_id}`,
    });

    return res.status(200).json({
      success: true,
      message: "Wallet recharged successfully",
      data: {
        walletBalance: Number(user.wallet.balance || 0),
        freeMinutesRemaining: Number(user.freeMinutesRemaining || 0),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to verify payment", error: err.message });
  }
};
