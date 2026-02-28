const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");

// Create feedback
router.post("/", feedbackController.createFeedback);

// Get all feedbacks
router.get("/", feedbackController.getAllFeedbacks);

// Get single feedback by ID
router.get("/:id", feedbackController.getFeedbackById);

// Update feedback
router.put("/:id", feedbackController.updateFeedback);

// Delete feedback
router.delete("/:id", feedbackController.deleteFeedback);

module.exports = router;
