const User = require('../models/UserDetail');
const NotificationToken = require("../models/NotificationToken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Astrologer = require("../models/Astrologer");
const FollowAstrologer = require("../models/FollowAstrologer");


const emailStore = {};

const { getNextSequenceValue } = require('../utilis/sequenceGenerator');
exports.signup = async (req, res) => {
  try {
    const { name, email, password, gender, city, mobileNo, dateOfBirth, timeOfBirth } = req.body;
    const profile = req.file?.path;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const userUid = await getNextSequenceValue("user_uid");
    const hashedPassword = await bcrypt.hash(password, 10);
    const loginToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      uid: userUid,
      name,
      email,
      password: hashedPassword,
      gender,
      city,
      mobileNo,
      dateOfBirth,
      timeOfBirth,
      profile,
      loginToken,
      wallet: {
        balance: 0,
        currency: "INR",
      },
      freeMinutesRemaining: 10,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      token: loginToken,
      data: newUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isLegacyPlainMatch = user.password === password;
    const isHashedMatch = await bcrypt.compare(password, user.password || "");
    if (!isLegacyPlainMatch && !isHashedMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const loginToken = crypto.randomBytes(32).toString("hex");
    user.loginToken = loginToken;
    await user.save();

    const fcmTokenDoc = await NotificationToken.findOne({
      userId: user._id,
      userType: "UserDetail",
    });

    res.json({
      message: "Login successful",
      token: loginToken,
      data: {
        ...user.toObject(),
        fcmToken: fcmTokenDoc ? fcmTokenDoc.fcmToken : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
      updates.profile = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

    res.json({ message: 'User updated successfully', data: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};


// exports.updateUser = async (req, res) => {
//   try {
//     const user = req.user; // from auth middleware
//     const {
//       name,
//       dob,
//       timeOfBirth,
//       gender,
//       maritalStatus,
//       address,
//       city,
//       state,
//       country,
//     } = req.body;

//     // ✅ Required Field Validation (Astro App)
//     if (!name || !dob || !timeOfBirth || !city) {
//       return res.status(400).json({
//         message: "Name, DOB, Time of Birth & City are required",
//       });
//     }

//     // ✅ Update fields
//     user.name = name;
//     user.dob = dob;
//     user.timeOfBirth = timeOfBirth;
//     user.gender = gender;
//     user.maritalStatus = maritalStatus;
//     user.address = address;
//     user.city = city;
//     user.state = state;
//     user.country = country;

//     // ✅ If profile image uploaded
//     if (req.file) {
//       user.profile = req.file.path;
//     }

//     // ✅ Profile Completed Logic
//     const profileCompleted =
//       user.name &&
//       user.dob &&
//       user.timeOfBirth &&
//       user.city;

//     user.profileCompleted = !!profileCompleted;

//     await user.save();

//     res.status(200).json({
//       message: "Profile updated successfully",
//       profileCompleted: user.profileCompleted,
//       data: user,
//     });

//   } catch (err) {
//     res.status(500).json({
//       message: "Update failed",
//       error: err.message,
//       console: console.error("Update user error:", err),
//     });
//   }
// };


exports.getUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const male = await User.countDocuments({ gender: 'male' });
    const female = await User.countDocuments({ gender: 'female' });

    res.status(200).json({
      message: 'User stats fetched successfully',
      data: {
        total,
        male,
        female
      }
    });
  } catch (err) {
    console.error('Admin user stats error:', err);
    res.status(500).json({
      message: 'Failed to fetch user stats',
      error: err.message
    });
  }
};

// ✅ Get all users (for admin)


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vikrantbhawani2020@gmail.com",
    pass: "kfcvjpvcsdiixzwh", // App Password
  },
});

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
}

// Send OTP API
exports.sendOTP = async (req, res) => {
  console.log("BODY:", req.body);
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = generateOTP();
  const expires = Date.now() + 5 * 60 * 1000; // valid for 5 mins

  emailStore[email] = { otp, expires, verified: false };

  const mailOptions = {
    from: "vikrantbhawani2020@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your verification OTP is ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
}

// Verify OTP API
exports.verifyOTP = (req, res) =>{
  const { email, otp } = req.body;
  const record = emailStore[email];

  if (!record) return res.status(400).json({ message: "No OTP sent to this email" });

  if (record.verified)
    return res.status(400).json({ message: "Email already verified" });

  if (Date.now() > record.expires)
    return res.status(400).json({ message: "OTP expired" });

  if (record.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  emailStore[email].verified = true;
  res.json({ message: "Email verified successfully" });
}


exports.updateFcmToken = async (req, res) => {
  try {
    const { id } = req.params;  // Mongo _id
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: "FCM Token is required" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { fcmToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "FCM token updated successfully",
      user
    });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// ...existing code...

exports.getUserList = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "following",
        select: "name profilePhoto"
      });

    res.status(200).json({
      message: 'Users fetched successfully',
      data: users
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch users',
      error: err.message
    });
  }
};




exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: "following",
        select: "name profilePhoto"
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "User fetched successfully",
      data: {
        ...user._doc,
        followingCount: user.following.length
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
};

// exports.socialLogin = async (req, res) => {
//   try {
//     const { email, name, mobileNo, profile } = req.body;
//     if (!email && !mobileNo) {
//       return res.status(400).json({ message: "email or mobileNo is required" });
//     }

//     let user = await User.findOne(
//       email ? { email } : { mobileNo }
//     );

//     if (!user) {
//       const userUid = await getNextSequenceValue("user_uid");
//       const fallbackPassword = await bcrypt.hash(crypto.randomBytes(12).toString("hex"), 10);
//       user = await User.create({
//         uid: userUid,
//         name: name || "User",
//         email: email || undefined,
//         mobileNo: mobileNo || undefined,
//         profile: profile || undefined,
//         password: fallbackPassword,
//         wallet: {
//           balance: 0,
//           currency: "INR",
//         },
//         freeMinutesRemaining: 10,
//       });
//     } else {
//       if (name && !user.name) user.name = name;
//       if (profile && !user.profile) user.profile = profile;
//     }

//     const loginToken = crypto.randomBytes(32).toString("hex");
//     user.loginToken = loginToken;
//     await user.save();

//     return res.status(200).json({
//       message: "Social login successful",
//       token: loginToken,
//       data: user,
//     });
//   } catch (err) {
//     return res.status(500).json({ message: "Social login failed", error: err.message });
//   }
// };



exports.socialLogin = async (req, res) => {
  try {
    const { email, name, mobileNo, profile } = req.body;

    if (!email && !mobileNo) {
      return res.status(400).json({ message: "email or mobileNo is required" });
    }

    let user = await User.findOne(
      email ? { email } : { mobileNo }
    );

    let isNewUser = false;

    // ✅ If user not found → Create new user
    if (!user) {
      isNewUser = true;

      const userUid = await getNextSequenceValue("user_uid");
      const fallbackPassword = await bcrypt.hash(
        crypto.randomBytes(12).toString("hex"),
        10
      );

      user = await User.create({
        uid: userUid,
        name: name || "",
        email: email || undefined,
        mobileNo: mobileNo || undefined,
        profile: profile || undefined,
        password: fallbackPassword,
        wallet: {
          balance: 0,
          currency: "INR",
        },
        freeMinutesRemaining: 10,
      });
    } else {
      // ✅ Update missing fields
      if (name && !user.name) user.name = name;
      if (profile && !user.profile) user.profile = profile;
    }

    // ✅ Check Profile Completed
    const profileCompleted =
      user.name &&
      user.mobileNo &&
      user.email &&
      user.dob &&
      user.address;

    // ✅ Generate Login Token
    const loginToken = crypto.randomBytes(32).toString("hex");
    user.loginToken = loginToken;

    await user.save();

    return res.status(200).json({
      message: "Social login successful",
      token: loginToken,
      isNewUser: isNewUser,
      profileCompleted: !!profileCompleted,
      data: user,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Social login failed",
      error: err.message,
    });
  }
};





// ...existing code...
// To check if email is verified before registration
// function isEmailVerified(email) {
//   return emailStore[email]?.verified === true;
// }



