const mongoose = require("mongoose");
const RatingReview = require("../models/RatingReview");
const Astrologer = require("../models/Astrologer");

/**
 * ⭐ Add / Update Rating & Review
 */
exports.addOrUpdateReview = async (req, res) => {
  try {
    const { userId, astrologerId, rating, review } = req.body;

    if (!mongoose.Types.ObjectId.isValid(astrologerId)) {
      return res.status(400).json({ success: false, message: "Invalid astrologerId" });
    }

    const existingReview = await RatingReview.findOne({
      user: userId,
      astrologer: astrologerId
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.review = review;
      await existingReview.save();
    } else {
      await RatingReview.create({
        user: userId,
        astrologer: astrologerId,
        rating,
        review
      });
    }

    // 🔁 Recalculate astrologer rating
    const stats = await RatingReview.aggregate([
      {
        $match: {
          astrologer: new mongoose.Types.ObjectId(astrologerId)
        }
      },
      {
        $group: {
          _id: "$astrologer",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    await Astrologer.findByIdAndUpdate(astrologerId, {
      averageRating: stats[0]?.avgRating || 0,
      totalReviews: stats[0]?.totalReviews || 0
    });

    res.status(200).json({
      success: true,
      message: "Rating & review saved successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 📥 Get Reviews of an Astrologer
 */
exports.getAstrologerReviews = async (req, res) => {
  try {
    const { astrologerId } = req.params;

    const reviews = await RatingReview.find({ astrologer: astrologerId })
      .populate("user", "name profile")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🗑 Delete Review
 */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    await RatingReview.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
