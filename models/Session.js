const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  communicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunicationRequest' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserDetail' },
  astrologer: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer' },
  type: { type: String, enum: ['chat', 'call', 'videoCall'] },
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
  totalDuration: Number,
  totalCharged: Number,
  ratePerSecond: Number,
  status: { type: String, enum: ['active', 'completed', 'terminated'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
