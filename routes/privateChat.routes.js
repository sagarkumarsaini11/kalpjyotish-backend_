const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const PrivateChat = require("../models/PrivateChat");
const UserDetail = require("../models/UserDetail");
const Astrologer = require("../models/Astrologer");
const createChatHash = require("../utilis/chatHash");
const { chargeUserUsage } = require("../utilis/billing");

/* ==========================
   GET CHAT HISTORY
========================== */
router.get("/history/:userId/:astroId", async (req, res) => {
  try {
    const { userId, astroId } = req.params;
    const chatId = createChatHash(userId, astroId);
    const chats = await PrivateChat.find({ chatId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Error loading chat" });
  }
});

/* ==========================
   ASTROLOGER CHAT THREADS
========================== */
router.get("/astrologer/:astrologerId/threads", async (req, res) => {
  try {
    const { astrologerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(astrologerId)) {
      return res.status(400).json({ message: "Invalid astrologerId" });
    }

    const astroObjectId = new mongoose.Types.ObjectId(astrologerId);

    const messages = await PrivateChat.find({
      $or: [{ senderId: astroObjectId }, { receiverId: astroObjectId }],
    }).sort({ createdAt: -1 });

    const threadMap = new Map();

    for (const msg of messages) {
      const senderId = String(msg.senderId);
      const receiverId = String(msg.receiverId);
      const astroId = String(astrologerId);
      const userId = senderId === astroId ? receiverId : senderId;

      if (!threadMap.has(userId)) {
        threadMap.set(userId, {
          userId,
          chatId: msg.chatId,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
        });
      }
    }

    const userIds = [...threadMap.keys()]
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const users = await UserDetail.find({ _id: { $in: userIds } }).select("name profile mobileNo");
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const threads = [...threadMap.values()].map((thread) => {
      const user = userMap.get(thread.userId);
      return {
        ...thread,
        userName: user?.name || "User",
        userProfile: user?.profile || null,
        userMobile: user?.mobileNo || null,
      };
    });

    return res.json({ success: true, data: threads });
  } catch (err) {
    return res.status(500).json({ message: "Error loading astrologer threads" });
  }
});

/* ==========================
   SEND MESSAGE
========================== */
router.post("/send", async (req, res) => {
  try {
    const { userId, astroId, senderId, senderType, message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const astrologer = await Astrologer.findById(astroId).select("chatFee perMinuteRate");
    if (!astrologer) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    if (senderType === "user") {
      const charge = await chargeUserUsage({
        userId,
        astrologerId: astroId,
        serviceType: "chat",
        minutes: 1,
        allowPartial: false,
      });

      if (!charge.ok) {
        return res.status(402).json({
          success: false,
          message: "Insufficient balance. Please recharge wallet.",
          data: charge,
        });
      }
    }

    const chatId = createChatHash(userId, astroId);

    const saved = await PrivateChat.create({
      chatId,
      senderId,
      receiverId: senderType === "user" ? astroId : userId,
      message,
      senderType,
    });

    return res.json({ success: true, data: saved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
