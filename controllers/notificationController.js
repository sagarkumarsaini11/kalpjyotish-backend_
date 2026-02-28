const NotificationToken = require("../models/NotificationToken");
const Notification = require("../models/Notification");

// Save new FCM token
exports.saveFcmToken = async (req, res) => {
  try {
    const { userId, fcmToken, deviceType } = req.body;
    const userType = req.body.userType === "astroModel" ? "Astrologer" : req.body.userType;

    if (!userId || !userType || !fcmToken) {
      return res.status(400).json({ message: "userId, userType and fcmToken are required" });
    }

    if (!["UserDetail", "Astrologer"].includes(userType)) {
      return res.status(400).json({ message: "Invalid userType" });
    }

    // check if token already exists
    // let tokenDoc = await NotificationToken.findOne({ fcmToken });

    // if (tokenDoc) {
    //   return res.status(400).json({ message: "FCM token already exists. Use update API instead." });
    // }
    // check if user already has a token, update it
    let existingToken = await NotificationToken.findOne({ userId });
    if (existingToken) {
      const updateToken = await NotificationToken.findOneAndUpdate(
        { userId },
        { fcmToken, deviceType },
        { new: true }
      );
      return res.status(200).json({ message: "FCM token updated for existing user", data: updateToken });
    }
    
    const newToken = new NotificationToken({ userId, userType, fcmToken, deviceType });
    await newToken.save();

    res.status(201).json({ message: "FCM token saved", data: newToken });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update existing token
exports.updateFcmToken = async (req, res) => {
  try {
    const { oldToken, newToken } = req.body;

    if (!oldToken || !newToken) {
      return res.status(400).json({ message: "oldToken and newToken are required" });
    }

    let tokenDoc = await NotificationToken.findOne({ fcmToken: oldToken });

    if (!tokenDoc) {
      return res.status(404).json({ message: "Old token not found" });
    }

    tokenDoc.fcmToken = newToken;
    await tokenDoc.save();

    res.json({ message: "FCM token updated", data: tokenDoc });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// POST - Create a notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, userType, title, body } = req.body;

    if (!userId || !userType || !title || !body) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["UserDetail", "Astrologer"].includes(userType)) {
      return res.status(400).json({ message: "Invalid userType" });
    }

    const newNotification = new Notification({
      userId,
      userType,
      title,
      body,
      isRead: false
    });

    await newNotification.save();

    res.status(201).json({
      message: "Notification created successfully",
      data: newNotification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET - Fetch notifications
exports.getNotifications = async (req, res) => {
  try {
    const { userId, userType } = req.query;

    let query = {};
    if (userId && userType) {
      query = { userId, userType };
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });

    res.json({
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const User = require("../models/UserDetail");
const Astrologer = require("../models/Astrologer");
const admin = require("../config/fcm");
const mongoose = require("mongoose");
const FollowAstrologer = require("../models/FollowAstrologer");

exports.sendNotification = async (req, res) => {
  try {
    const { name, profilePic, id, type, channelName, fcmToken, userType } = req.body;

    // 1️⃣ Basic validation
    if (!name || !id || !type || !channelName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const receiverType = userType || "UserDetail"; // default

    let tokens = [];

    // --------------------------------------------------
    // 2️⃣ TOKEN COLLECTION
    // --------------------------------------------------

    // Voice / Video → single user
    if (type === "voice" || type === "video") {
      if (!fcmToken) {
        return res.status(400).json({
          success: false,
          message: "FCM token required for voice/video"
        });
      }
      tokens.push(fcmToken);
    }

    // Stream → followers
    if (type === "stream") {
          const followersData = await FollowAstrologer.find({
            astrologerId,
            isFollowed: true
          })
            .populate("userId", "name profile email")
            .lean();
      
          const followers = followersData.map(f => f.userId);
          if (followers.length === 0) {
            return res.status(200).json({
              success: true,
              message: "No followers to notify"
            });
          }

          const tokenDocs = await NotificationToken.find({
            userId: { $in: followers },
            fcmToken: { $exists: true, $ne: null }
          }).select("fcmToken");
          tokens = tokenDocs.map(t => t.fcmToken);
      // const astro = await Astro.findById(id).select("followers");
      // if (astro?.followers?.length) {
      //   const tokenDocs = await NotificationToken.find({
      //     userId: { $in: astro.followers },
      //     fcmToken: { $exists: true, $ne: null }
      //   }).select("fcmToken");

      //   tokens = tokenDocs.map(t => t.fcmToken);
      // }
    }

    // --------------------------------------------------
    // 3️⃣ SAVE NOTIFICATION (ALWAYS)
    // --------------------------------------------------
    const savedNotification = await Notification.create({
      userId: id,
      userType: receiverType,
      title: `${name} started a ${type}`,
      body: `Channel: ${channelName}`,
      isRead: false
    });

    // --------------------------------------------------
    // 4️⃣ SEND PUSH (OPTIONAL)
    // --------------------------------------------------
    let fcmResponse = null;

    if (tokens.length > 0) {
      console.log("tokens",tokens);
      
      try {
        fcmResponse = await admin.messaging().sendEachForMulticast({
          tokens,
          notification: {
            title: `Starting ${type} call`,
            body: `${name} started a ${type} call. Join now!`,
          },
          data: {
            type: "incoming_call",
            callerName: String(name),
            profilePic: String(profilePic || ""),
            callerId: String(id),
            receiverId: String(id),
            callType: String(type),
            channelName: String(channelName),
            // notificationId: String(savedNotification._id) // 🔥 VERY IMPORTANT
          },
          android: { priority: "high" },
          apns: { payload: { aps: { "content-available": 1 } } }
        });
      } catch (fcmErr) {
        console.error("FCM Error:", fcmErr.message);
        // ❗ Do NOT fail API if push fails
      }
    }

    // --------------------------------------------------
    // 5️⃣ FINAL RESPONSE
    // --------------------------------------------------
  return res.json({
  success: true,
  message: "Notification saved & processed",
  data: {
    _id: savedNotification._id,
    userId: savedNotification.userId,
    userType: savedNotification.userType,
    title: savedNotification.title,
    body: savedNotification.body,
    type: savedNotification.type,
    fcmToken: savedNotification.fcmToken || null,
    isRead: savedNotification.isRead,
    createdAt: savedNotification.createdAt,
    updatedAt: savedNotification.updatedAt
  },
  fcmResponse
});


  } catch (err) {
    console.error("sendNotification Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



// GET /api/notifications?userId=&userType=


exports.getUserNotifications = async (req, res) => {
  try {
    const { userId, notificationId } = req.query;

    // ❌ No params
    if (!userId && !notificationId) {
      return res.status(400).json({
        success: false,
        message: "userId or notificationId is required"
      });
    }

    let query = {};

    // 🔹 Single notification
    if (notificationId) {
      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return res.status(400).json({ success: false, message: "Invalid notificationId" });
      }
      query._id = notificationId;
    }

    // 🔹 All notifications for user
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid userId" });
      }
      query.userId = userId;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




// PATCH /api/notifications/read/:id


// PATCH /api/notification/read/:id
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification id"
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      data: notification
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET /api/notifications/unread-count?userId=&userType=


// GET /api/notification/unread-count?userId=
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId"
      });
    }

    const count = await Notification.countDocuments({
      userId,
      isRead: false
    });

    return res.json({
      success: true,
      data: {
        count
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};





