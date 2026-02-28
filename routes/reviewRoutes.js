const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Create Review
router.post("/", reviewController.createReview);

// Get Reviews by Astrologer + Avg rating
router.get("/:astrologerId", reviewController.getReviewsByAstrologer);

// Update Review
router.put("/:reviewId", reviewController.updateReview);

// Delete Review
router.delete("/:reviewId", reviewController.deleteReview);

module.exports = router;
