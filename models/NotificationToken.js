const mongoose = require("mongoose");

const notificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userType", // will reference either UserDetail or Astrologer
      required: true,
    },
    userType: {
      type: String,
      enum: ["UserDetail", "Astrologer"],
      required: true,
    },
       type: {
      type: String,
      enum: ["voice", "video", "stream", "general"],
      default: "general"
    },
   fcmToken: { type: String, default: null },

    deviceType: {
      type: String,
      enum: ["android", "ios", "web"],
      default: "web",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotificationToken", notificationTokenSchema);
