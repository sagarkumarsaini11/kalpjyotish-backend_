const mongoose = require("mongoose");

const ratingReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetail",
      required: true
    },
    astrologer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Astrologer",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: 500
    }
  },
  { timestamps: true }
);

// ❗ Prevent multiple reviews by same user for same astrologer
ratingReviewSchema.index({ user: 1, astrologer: 1 }, { unique: true });

module.exports = mongoose.model("RatingReview", ratingReviewSchema);
