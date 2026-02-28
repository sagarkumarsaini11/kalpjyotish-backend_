const cron = require('node-cron');
const Session = require('../models/Session');
const User = require('../models/UserDetail');
const Transaction = require('../models/Transaction');

cron.schedule('* * * * * *', async () => {
  const activeSessions = await Session.find({ status: 'active' });

  for (const session of activeSessions) {
    const now = new Date();
    const secondsElapsed = Math.floor((now - new Date(session.startedAt)) / 1000);
    const charge = secondsElapsed * session.ratePerSecond;

    const user = await User.findById(session.user);

    if (user.wallet.balance < charge) {
      session.status = 'terminated';
      session.endedAt = now;
      await session.save();
    } else {
      user.wallet.balance -= charge;
      await user.save();

      await Transaction.create({
        userId: user._id,
        type: 'debit',
        amount: charge,
        reason: session.type
      });

      session.totalDuration = secondsElapsed;
      session.totalCharged = charge;
      await session.save();
    }
  }
});
