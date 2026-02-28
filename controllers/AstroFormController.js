const AstroForm = require("../models/AstroForm");

// STEP 1 — Create AstroForm entry
exports.createAstroForm = async (req, res) => {
  try {
    const { name, number, skills } = req.body;

    // Check duplicate number
    const exists = await AstroForm.findOne({ number });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Number already registered"
      });
    }

    const newAstro = await AstroForm.create({
      name,
      number,
      skills
    });

    return res.status(201).json({
      success: true,
      message: "OTP sent (static 1234)",
      data: newAstro
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// STEP 2 — Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { number, otp } = req.body;

    const astro = await AstroForm.findOne({ number });
    if (!astro) {
      return res.status(404).json({
        success: false,
        message: "Number not found"
      });
    }

    if (otp !== "1234") {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    astro.isVerified = true;
    await astro.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: astro
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
