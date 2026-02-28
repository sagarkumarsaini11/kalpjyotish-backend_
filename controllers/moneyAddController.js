const MoneyAdd = require('../models/MoneyAdd');
const UserDetail = require('../models/UserDetail');

// Generate prototype offers dynamically
const generateOffers = () => {
  const baseAmounts = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  return baseAmounts.map(amount => {
    const discount = amount <= 500 ? 30 : 50;
    const finalAmount = amount + (amount * discount) / 100;
    return {
      value: amount,
      discountPercent: discount,
      afterDiscountAmount: finalAmount
    };
  });
};

// ✅ POST: Add Money record (prototype)
exports.addMoney = async (req, res) => {
  try {
    const { userId, selectedAmount } = req.body;

    if (!userId || !selectedAmount) {
      return res.status(400).json({ success: false, message: "userId and selectedAmount are required." });
    }

    const user = await UserDetail.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const discountPercent = selectedAmount <= 500 ? 30 : 50;
    const finalAmount = selectedAmount + (selectedAmount * discountPercent) / 100;

    const moneyAdd = new MoneyAdd({
      userId,
      selectedAmount,
      discountPercent,
      finalAmount
    });

    await moneyAdd.save();

    res.status(201).json({
      success: true,
      message: "Money added prototype created successfully.",
      data: moneyAdd
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ GET: Get Money prototype options
exports.getMoneyOptions = async (req, res) => {
  try {
    const offers = generateOffers();
    res.status(200).json({ success: true, data: offers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ GET: Get money add record by userId
exports.getMoneyByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const records = await MoneyAdd.find({ userId })
      .populate('userId', 'name email mobileNo profile');

    if (!records.length) {
      return res.status(404).json({ success: false, message: "No records found for this user." });
    }

    // Calculate available balance
    const totalFinalAmount = records.reduce((sum, record) => sum + (record.finalAmount || 0), 0);
    const debitBalance = 0; // placeholder for future debit transactions
    const availableBalance = totalFinalAmount - debitBalance;

    res.status(200).json({
      success: true,
      availableBalance,
      debitBalance,
      totalFinalAmount,
      data: records
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

