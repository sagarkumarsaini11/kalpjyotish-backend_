const Session = require('../models/Session');
const User = require('../models/UserDetail');
const CommunicationRequest = require('../models/CommunicationRequest');

const rates = {
  chat: 0.1,
  call: 0.5,
  videoCall: 1.0
};

exports.startSession = async (req, res) => {
  try {
    const { communicationId } = req.body;

    const request = await CommunicationRequest.findById(communicationId)
      .populate('user')
      .populate('astrologer');

    if (!request || request.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Invalid or unaccepted request' });
    }

    const user = await User.findById(request.user._id);

    const rate = rates[request.type];
    // if (user.wallet.balance < rate) {
    //   return res.status(400).json({ success: false, message: 'Insufficient balance' });
    // }

    const session = await Session.create({
      communicationId,
      user: request.user._id,
      astrologer: request.astrologer._id,
      type: request.type,
      ratePerSecond: rate
    });

    res.status(200).json({ success: true, message: 'Session started', session });
  } catch (err) {
    console.error('Start session error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


const Transaction = require('../models/Transaction');

exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId).populate('user');
    if (!session || session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session already ended or invalid' });
    }

    const now = new Date();
    const seconds = Math.floor((now - new Date(session.startedAt)) / 1000);
    const charge = seconds * session.ratePerSecond;

    const user = session.user;
    if (user.wallet.balance < charge) {
      session.status = 'terminated';
    } else {
      session.status = 'completed';
      user.wallet.balance -= charge;
      await user.save();

      await Transaction.create({
        userId: user._id,
        type: 'debit',
        amount: charge,
        reason: session.type
      });
    }

    session.endedAt = now;
    session.totalDuration = seconds;
    session.totalCharged = charge;
    await session.save();

    res.status(200).json({ success: true, message: 'Session ended', session });
  } catch (err) {
    console.error('End session error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
