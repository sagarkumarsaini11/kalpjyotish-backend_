// routes/otpRoutes.js
const express = require("express");
const router = express.Router();
const otpController = require("../controllers/otpController");

// Send OTP
router.post("/send-otp", otpController.sendOtp);

// Verify OTP
router.post("/verify-otp", otpController.verifyOtp);

module.exports = router;
