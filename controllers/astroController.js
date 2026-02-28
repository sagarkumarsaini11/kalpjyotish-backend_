const Astrologer = require("../models/Astrologer");
const FollowAstrologer = require("../models/FollowAstrologer");
const RatingReview = require("../models/RatingReview");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");


// Helper to generate 4-digit random number


// -----------------------------------------------
// Generate EID like KALP1234
// -----------------------------------------------
const generateEID = () => {
  const num = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `KALP${num}`;
};

// -----------------------------------------------
// Generate 12-char system password
// -----------------------------------------------
const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

// -----------------------------------------------
// CREATE ASTROLOGER
// -----------------------------------------------
exports.createAstrologer = async (req, res) => {
  try {
    let profilePhoto = null;

    if (req.files && req.files.length > 0) {
      const file = req.files.find((f) => f.fieldname === "profilePhoto");
      if (file) profilePhoto = file.path;
    }

    const parseArrayField = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
        return value.split(",").map((v) => v.trim()).filter(Boolean);
      }
      return [];
    };

    let available_at = req.body.available_at;
    if (typeof available_at === "string") {
      try {
        available_at = JSON.parse(available_at);
      } catch {
        available_at = {};
      }
    }

    const rawPassword = req.body.password || generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newData = {
      ...req.body,
      eid: generateEID(),
      password: hashedPassword,
      isSystemGeneratedPassword: !req.body.password,
      profilePhoto,
      practice: parseArrayField(req.body.practice),
      languages: parseArrayField(req.body.languages),
      skills: parseArrayField(req.body.skills || req.body.specialization),
      available_at: {
        chat: Boolean(available_at?.chat),
        call: Boolean(available_at?.call),
        videoCall: Boolean(available_at?.videoCall),
      },
    };

    const astro = await Astrologer.create(newData);

    res.status(201).json({
      success: true,
      message: "Astrologer created successfully",
      data: {
        ...astro._doc,
        systemPassword: req.body.password ? undefined : rawPassword,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL
const { getRatingSummaryForAstros } = require("../utilis/ratingHelper");

exports.getAllAstrologers = async (req, res) => {
  try {
    console.log("getAllAstrologers called", req.query);
    const {type} = req.query;
    const userId = req.query.userId || null;
let astrologers = null;
    if(type){
      // Filter by type if provided
      astrologers = await Astrologer.find({
  [`available_at.${type}`]: true,
}).lean();
      // return res.status(200).json({ success: true, data: astrologers });
    }
    else{
     astrologers = await Astrologer.find().lean();
    }
    const astroIds = astrologers.map(a => a._id.toString());

    // followers (unchanged)
    const followMap = await FollowAstrologer.find({
      astrologerId: { $in: astroIds },
      isFollowed: true
    })
      .populate("userId", "name profile email")
      .lean();

    const followerGrouped = {};
    followMap.forEach(f => {
      if (!followerGrouped[f.astrologerId]) {
        followerGrouped[f.astrologerId] = [];
      }
      followerGrouped[f.astrologerId].push(f.userId);
    });

    // ⭐ rating summary
    const ratingMap = await getRatingSummaryForAstros(astroIds);

    const finalAstros = astrologers.map(a => {
      console.log("Astrologer:", a);
      const followers = followerGrouped[a._id] || [];
      const rating = ratingMap[a._id.toString()] || {
        averageRating: 0,
        totalReviews: 0,
        stars: { 1:0, 2:0, 3:0, 4:0, 5:0 }
      };

      return {
        ...a,
        followers,
        followersCount: followers.length,
        isFollowed: userId
          ? followers.some(f => String(f._id) === String(userId))
          : false,
        ratingSummary: rating
      };
    });

    res.status(200).json({ success: true, data: finalAstros });

  } catch (err) {
    console.error("getAllAstrologers:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




// GET SINGLE

exports.getAstrologer = async (req, res) => {
  try {
    const astrologerId = req.params.id;
    const userId = req.query.userId || null;

    const astro = await Astrologer.findById(astrologerId).lean();
    if (!astro)
      return res.status(404).json({ success: false, message: "Not found" });

    const followersData = await FollowAstrologer.find({
      astrologerId,
      isFollowed: true
    })
      .populate("userId", "name profile email")
      .lean();

    const followers = followersData.map(f => f.userId);

    // ⭐ rating summary
    const ratingMap = await getRatingSummaryForAstros([astrologerId]);
    const ratingSummary = ratingMap[astrologerId] || {
      averageRating: 0,
      totalReviews: 0,
      stars: { 1:0, 2:0, 3:0, 4:0, 5:0 }
    };

    res.status(200).json({
      success: true,
      data: {
        ...astro,
        followers,
        followersCount: followers.length,
        isFollowed: userId
          ? followers.some(f => String(f._id) === String(userId))
          : false,
        ratingSummary
      }
    });

  } catch (err) {
    console.error("getAstrologer:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// UPDATE
exports.updateAstrologer = async (req, res) => {
  try {
    let profilePhoto;

    if (req.files && req.files.length > 0) {
      const file = req.files.find(f => f.fieldname === "profilePhoto");
      if (file) profilePhoto = file.path;
    }

    const updateData = {
      ...req.body,
      available_at: req.body.available_at
        ? JSON.parse(req.body.available_at)
        : undefined,
    };

    if (profilePhoto) updateData.profilePhoto = profilePhoto;

    const updated = await Astrologer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
exports.deleteAstrologer = async (req, res) => {
  try {
    await Astrologer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Astrologer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




// LOGIN (EID / Number + Password)
exports.loginAstro = async (req, res) => {
  try {
    const { eid, number, email, password } = req.body;

    const clauses = [];
    if (eid) clauses.push({ eid });
    if (number) clauses.push({ number });
    if (email) clauses.push({ email });

    if (!clauses.length || !password) {
      return res.status(400).json({ success: false, message: "Login ID and password are required" });
    }

    const astro = await Astrologer.findOne({ $or: clauses });

    if (!astro) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    const isMatch = await bcrypt.compare(password, astro.password || "");
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    if (astro.isSystemGeneratedPassword) {
      return res.status(200).json({
        success: true,
        resetRequired: true,
        message: "Password reset required before login",
        eid: astro.eid,
        number: astro.number,
      });
    }

    const loginToken = crypto.randomBytes(32).toString("hex");
    astro.loginToken = loginToken;
    await astro.save();

    const astroSafe = astro.toObject();
    delete astroSafe.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: loginToken,
      data: astroSafe,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendResetOtp = async (req, res) => {
  try {
    const { eid } = req.body;

    const astro = await Astrologer.findOne({ eid });

    if (!astro) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    // For now static OTP
    const otp = "1234";

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp: otp // remove this in production
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { eid, otp, newPassword } = req.body;

    if (otp !== "1234") {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const astro = await Astrologer.findOne({ eid });

    if (!astro) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    // Encrypt new password
    const hashed = await bcrypt.hash(newPassword, 10);

    astro.password = hashed;
    astro.isSystemGeneratedPassword = false;
    await astro.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// PATCH /api/astrologer/update-availability/:id
const mongoose = require("mongoose");

exports.updateAstrologerAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { chat, call, videoCall } = req.body;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid astrologer ID"
      });
    }

    const update = {};
    if (typeof chat === "boolean") update["available_at.chat"] = chat;
    if (typeof call === "boolean") update["available_at.call"] = call;
    if (typeof videoCall === "boolean") update["available_at.videoCall"] = videoCall;

    if (!Object.keys(update).length) {
      return res.status(400).json({
        success: false,
        message: "No availability fields provided"
      });
    }

    const astrologer = await Astrologer.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    if (!astrologer) {
      return res.status(404).json({
        success: false,
        message: "Astrologer not found in database"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: {
        _id: astrologer._id,
        available_at: astrologer.available_at
      }
    });

  } catch (err) {
    console.error("Availability update error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

