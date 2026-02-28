const Review = require("../models/Review");
const Astrologer = require("../models/Astrologer");

// ➤ Create Review
exports.createReview = async (req, res) => {
  try {
    const { userId, astrologerId, rating, review } = req.body;

    const newReview = new Review({ userId, astrologerId, rating, review });
    await newReview.save();

    res.status(201).json({ message: "Review added successfully", review: newReview });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You already reviewed this astrologer" });
    }
    res.status(500).json({ message: "Error creating review", error: error.message });
  }
};

// ➤ Get All Reviews of an Astrologer + Average Rating
exports.getReviewsByAstrologer = async (req, res) => {
  try {
    const { astrologerId } = req.params;

    const reviews = await Review.find({ astrologerId })
      .populate("userId", "name profile")
      .sort({ createdAt: -1 });

    const average = await Review.aggregate([
      { $match: { astrologerId: new Review.Types.ObjectId(astrologerId) } },
      { $group: { _id: "$astrologerId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      message: "Reviews fetched successfully",
      reviews,
      averageRating: average.length ? average[0].avgRating.toFixed(1) : 0,
      totalReviews: average.length ? average[0].count : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};

// ➤ Update Review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review } = req.body;

    const updated = await Review.findByIdAndUpdate(
      reviewId,
      { rating, review },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Review not found" });

    res.status(200).json({ message: "Review updated successfully", review: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating review", error: error.message });
  }
};

// ➤ Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const deleted = await Review.findByIdAndDelete(reviewId);
    if (!deleted) return res.status(404).json({ message: "Review not found" });

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error: error.message });
  }
};
