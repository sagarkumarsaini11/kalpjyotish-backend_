const mongoose = require("mongoose");

const chatLogSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetail",
      required: true
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Astro",
      required: true
    },

    senderName: {
      type: String,
    },
    senderProfilePic: { 
      type: String, 
    },

    chatId: { 
      type: String, 
      required: true 
    },

    time: {
      type: Date,
    },

    
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatLog", chatLogSchema);



