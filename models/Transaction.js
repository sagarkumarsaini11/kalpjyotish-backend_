const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserDetail' },
  type: { type: String, enum: ['debit', 'credit'] },
  amount: Number,
  reason: String, // "chat", "call", "videoCall"
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
