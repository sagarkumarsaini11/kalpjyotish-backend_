const ChatLog = require("../models/chatModel");
const admin = require("../config/fcm");
const NotificationToken = require("../models/NotificationToken");
const Notification = require("../models/Notification");
const Astrologer  = require("../models/Astrologer");

exports.startChat = async (req, res) => {
  try {
    const {
      senderId,
      receiverId,
      senderProfilePic,
      senderName,
      chatId,
      time,
      message   // ✅ NEW FIELD
    } = req.body;

    if (!senderId || !receiverId || !chatId || !message) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // ✅ Save chat with message
    const chat = await ChatLog.create({
      senderId,
      receiverId,
      senderName,
      senderProfilePic,
      chatId,
      time,
      message
    });

    // ✅ Get receiver FCM token
    const tokenDoc = await NotificationToken.findOne({ userId: receiverId });

    if (tokenDoc?.fcmToken) {
      const resp = await admin.messaging().sendEachForMulticast({
        tokens: [tokenDoc.fcmToken],
        notification: {
          title: `${senderName} sent a message`,
          body: message   // ✅ SHOW MESSAGE
        },
        data: {
          type: "chat",
          senderId: String(senderId),
          receiverId: String(receiverId),
          profilePic: senderProfilePic,
          chatId,
          senderName,
          message,  // ✅ SEND IN DATA
          time: String(time || Date.now()),
        },
        android: { priority: "high" },
        apns: { payload: { aps: { "content-available": 1 } } }
      });

      console.log("FCM chat notification sent:", resp);
    }

    // ✅ Save Notification
    await Notification.create({
      userId: receiverId,
      userType: "Astrologer",
      title: `${senderName} sent a message`,
      body: message,
      fcmToken: tokenDoc?.fcmToken || null,
      isRead: false
    });

    return res.json({
      success: true,
      message: "Message sent successfully",
      data: chat
    });

  } catch (error) {
    res.status(500).json({ message: "Internal error", error: error.message });
  }
};




const User = require("../models/UserDetail");

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal error",
      error: error.message
    });
  }
};



exports.getAstrologerById = async (req, res) => {
  try {
    const { id } = req.params;

    const astro = await Astrologer.findById(id);

    if (!astro) {
      return res.status(404).json({
        success: false,
        message: "Astrologer not found"
      });
    }

    return res.json({
      success: true,
      data: astro
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal error",
      error: error.message
    });
  }
};