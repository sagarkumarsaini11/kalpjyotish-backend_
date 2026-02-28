const mongoose = require("mongoose");
const UserDetail = require("../models/UserDetail");
const Astrologer = require("../models/Astrologer");

const DEFAULT_RATE = 10;

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const getRateByType = (astrologer, serviceType) => {
  const base = Number(astrologer?.perMinuteRate || DEFAULT_RATE);
  const chatRate = Number(astrologer?.chatFee || astrologer?.charges?.chat || base);
  const voiceRate = Number(astrologer?.callFee || astrologer?.charges?.call || base);
  const videoRate = Number(astrologer?.videoFee || astrologer?.charges?.videoCall || voiceRate);

  if (serviceType === "chat") return chatRate > 0 ? chatRate : DEFAULT_RATE;
  if (serviceType === "video") return videoRate > 0 ? videoRate : DEFAULT_RATE;
  return voiceRate > 0 ? voiceRate : DEFAULT_RATE;
};

const fetchUserAndAstrologer = async ({ userId, astrologerId }) => {
  if (!mongoose.Types.ObjectId.isValid(String(userId || ""))) {
    return { ok: false, message: "Invalid userId" };
  }
  if (!mongoose.Types.ObjectId.isValid(String(astrologerId || ""))) {
    return { ok: false, message: "Invalid astrologerId" };
  }

  const [user, astrologer] = await Promise.all([
    UserDetail.findById(userId),
    Astrologer.findById(astrologerId),
  ]);

  if (!user) return { ok: false, message: "User not found" };
  if (!astrologer) return { ok: false, message: "Astrologer not found" };

  return { ok: true, user, astrologer };
};

const canAffordSessionStart = async ({ userId, astrologerId, serviceType }) => {
  const loaded = await fetchUserAndAstrologer({ userId, astrologerId });
  if (!loaded.ok) return loaded;

  const { user, astrologer } = loaded;
  const rate = getRateByType(astrologer, serviceType);
  const freeMinutesRemaining = Number(user.freeMinutesRemaining || 0);
  const walletBalance = Number(user.wallet?.balance || 0);
  const canStart = freeMinutesRemaining > 0 || walletBalance >= rate;

  return {
    ok: canStart,
    message: canStart ? "ok" : "Insufficient balance to start session",
    ratePerMinute: rate,
    freeMinutesRemaining: round2(freeMinutesRemaining),
    walletBalance: round2(walletBalance),
    requiredForOneMinute: round2(rate),
  };
};

const chargeUserUsage = async ({
  userId,
  astrologerId,
  serviceType,
  minutes,
  allowPartial = false,
}) => {
  const loaded = await fetchUserAndAstrologer({ userId, astrologerId });
  if (!loaded.ok) return loaded;

  const { user, astrologer } = loaded;
  const rate = getRateByType(astrologer, serviceType);
  const usedMinutes = Math.max(round2(minutes || 0), 0);

  const freeBefore = Number(user.freeMinutesRemaining || 0);
  const walletBefore = Number(user.wallet?.balance || 0);

  const freeUsed = Math.min(freeBefore, usedMinutes);
  const paidMinutes = Math.max(usedMinutes - freeUsed, 0);
  const amountToDeduct = round2(paidMinutes * rate);

  if (walletBefore < amountToDeduct && !allowPartial) {
    return {
      ok: false,
      message: "Insufficient wallet balance",
      ratePerMinute: rate,
      requiredAmount: amountToDeduct,
      walletBalance: round2(walletBefore),
      freeMinutesRemaining: round2(freeBefore),
    };
  }

  let finalDeduction = amountToDeduct;
  let finalPaidMinutes = paidMinutes;
  if (walletBefore < amountToDeduct && allowPartial) {
    finalDeduction = round2(walletBefore);
    finalPaidMinutes = rate > 0 ? round2(finalDeduction / rate) : 0;
  }

  user.freeMinutesRemaining = round2(freeBefore - freeUsed);
  user.wallet = user.wallet || { balance: 0, currency: "INR" };
  user.wallet.balance = round2(walletBefore - finalDeduction);
  await user.save();

  return {
    ok: true,
    ratePerMinute: rate,
    usedMinutes,
    freeUsedMinutes: round2(freeUsed),
    paidMinutes: round2(finalPaidMinutes),
    deductedAmount: round2(finalDeduction),
    walletBalance: round2(user.wallet.balance),
    freeMinutesRemaining: round2(user.freeMinutesRemaining),
  };
};

module.exports = {
  canAffordSessionStart,
  chargeUserUsage,
  getRateByType,
};
