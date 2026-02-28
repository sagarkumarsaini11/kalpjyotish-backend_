const express = require("express");
const router = express.Router();
const { createAstroForm, verifyOtp } = require("../controllers/AstroFormController");

router.post("/submit", createAstroForm);   // Step 1
router.post("/verify-otp", verifyOtp);     // Step 2

module.exports = router;
