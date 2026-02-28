const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetail",
      required: true
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Astro",
      required: true
    },

    // chat added as you need earnings by chat, voice, video, live
    callType: {
      type: String,
      enum: ["chat", "voice", "video", "live"],
      required: true
    },

    channelName: { 
      type: String, 
      required: true 
    },

    status: {
      type: String,
      enum: ["ringing", "accepted", "rejected", "missed", "ended"],
      default: "ringing"
    },

    // session duration (very important for earnings)
    duration: {
      type: Number, // in milliseconds
      default: 0
    },

    // calculate earning based on rate per minute or rate per second
    ratePerMinute: {
      type: Number,
      default: 0
    },

    totalEarning: {
      type: Number,
      default: 0
    },

    endTime: { 
      type: Date 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallLog", callLogSchema);
