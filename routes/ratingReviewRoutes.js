const express = require("express");
const router = express.Router();
const ratingReviewController = require("../controllers/ratingReviewController");

router.post("/rate-review", ratingReviewController.addOrUpdateReview);
router.get("/astrologer/:astrologerId", ratingReviewController.getAstrologerReviews);
router.delete("/:reviewId", ratingReviewController.deleteReview);

module.exports = router;
