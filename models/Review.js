const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetail",
      required: true,
    },
    astrologerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Astrologer",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

// Prevent duplicate review from same user to same astrologer
reviewSchema.index({ userId: 1, astrologerId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
