const Feedback = require("../models/Feedback");

// ✅ Create Feedback
exports.createFeedback = async (req, res) => {
  try {
    const { userId, rating, review } = req.body;

    if (!userId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "All fields (userId, rating, review) are required",
      });
    }

    const feedback = await Feedback.create({ userId, rating, review });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while creating feedback",
      error: error.message,
    });
  }
};

// ✅ Get All Feedbacks
exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("userId", "name profile")
      .sort({ createdAt: -1 });

    const avgData = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      message: "Feedbacks fetched successfully",
      data: {
        feedbacks,
        averageRating: avgData.length ? avgData[0].avgRating.toFixed(1) : "0.0",
        totalFeedbacks: avgData.length ? avgData[0].count : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching feedbacks",
      error: error.message,
    });
  }
};

// ✅ Get Single Feedback
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate("userId", "name profile");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback fetched successfully",
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching feedback",
      error: error.message,
    });
  }
};

// ✅ Update Feedback
exports.updateFeedback = async (req, res) => {
  try {
    const { rating, review } = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { rating, review },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: updatedFeedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating feedback",
      error: error.message,
    });
  }
};

// ✅ Delete Feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!deletedFeedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while deleting feedback",
      error: error.message,
    });
  }
};
