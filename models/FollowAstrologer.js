const mongoose = require("mongoose");

const FollowAstrologerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetail",
      required: true
    },
    astrologerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Astrologer",
      required: true
    },
    isFollowed: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.FollowAstrologer ||
  mongoose.model("FollowAstrologer", FollowAstrologerSchema);
