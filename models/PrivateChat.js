const mongoose = require("mongoose");

const privateChatSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    senderType: {
      type: String,
      enum: ["user", "astrologer"],
      required: true,
    },
  },
  { timestamps: true }
);

privateChatSchema.index({ chatId: 1, createdAt: 1 });

module.exports = mongoose.model("PrivateChat", privateChatSchema);
