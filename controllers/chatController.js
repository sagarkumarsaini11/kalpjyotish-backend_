const ChatLog = require("../models/chatModel");
const admin = require("../config/fcm");
const NotificationToken = require("../models/NotificationToken");
const Notification = require("../models/Notification");

exports.startChat = async (req, res) => {
  try {
    const {
      senderId,       
      receiverId,   
      senderProfilePic,    
      senderName,
      chatId,
      time
    } = req.body;

    if (!senderId || !receiverId || !chatId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Create chat record
    const chat = await ChatLog.create({
      senderId,
      receiverId,
      senderName,
      senderProfilePic,
      chatId,
      time,
    });

    // Get receiver FCM (Astrologer)
    const tokenDoc = await NotificationToken.findOne({ userId: receiverId });
    if (tokenDoc?.fcmToken) {
      const resp = await admin.messaging().sendEachForMulticast({
        tokens: [tokenDoc.fcmToken],
        notification: {
          title: `${senderName} is messaging you`,
          body: ``
        },
        data: {
          type: "chat",
          senderId: String(senderId),
          receiverId: String(receiverId),
          profilePic:senderProfilePic,
          chatId,
          senderName,
          time: String(time || Date.now()),
        },
                android: { priority: "high" },
          apns: { payload: { aps: { "content-available": 1 } } }
      });
      console.log("FCM chat notification sent:", resp);
    }

      // --------------------------------------------------
    // 3️⃣ SAVE NOTIFICATION (ALWAYS)
    // --------------------------------------------------
    await Notification.create({
      userId: receiverId,
      userType: 'Astrologer',
      title: `${senderName} started a chat`,
      body: `Chat ID: ${chatId}`,
      fcmToken: tokenDoc?.fcmToken || null,
      isRead: false
    });

    return res.json({
      success: true,
      message: "Chat started successfully",
      data: chat
    });

  } catch (error) {
    res.status(500).json({ message: "Internal error", error: error.message });
  }
};




