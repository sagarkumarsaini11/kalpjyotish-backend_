const express = require("express");


const {
  saveFcmToken,
  updateFcmToken,
  createNotification,
  sendNotification,
  getNotifications,
  getUserNotifications,   // ✅ ADD
  markAsRead,             // ✅ ADD
  getUnreadCount          // ✅ ADD
} = require("../controllers/notificationController");

const router = express.Router();

// Save new token
router.post("/save-token", saveFcmToken);

// Update existing token
router.put("/update-token", updateFcmToken);

router.post("/create", createNotification);

// Fetch all or by user/astrologer id
router.get("/list", getNotifications);

router.post("/send-notification", sendNotification);


router.get("/UserNotification", getUserNotifications);
router.patch("/read/:id", markAsRead);
router.get("/unread-count", getUnreadCount);


module.exports = router;
