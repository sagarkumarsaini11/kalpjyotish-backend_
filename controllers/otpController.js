// // const PhoneAuth = require('../models/PhoneAuth');
// // const UserDetail = require('../models/UserDetail');
// // const { generateToken } = require('../utilis/jwt.utils');

// // exports.verifyOtp = async (req, res) => {
// //   try {
// //     const { phone, otp } = req.body;

// //     if (!phone || !otp) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Phone number and OTP are required",
// //       });
// //     }

// //     // // ✅ Step 1: Check if phone number already exists in OTP DB
// //     // const existing = await PhoneAuth.findOne({ phone });

// //     // ✅ Step 2: Verify OTP (static mock OTP = 1234)
// //     if (otp !== "1234") {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid OTP",
// //       });
// //     }
// // let user;
// //     // if(existing){
// //       user = await UserDetail.findOne({ mobileNo: phone }).select('-token');
// //        console.log(`user found : ${user}`);
       
// //       if(!user){
// //         user = await UserDetail.create({
// //           mobileNo: phone,
// //           isVerified: true,
// //           following: [],
// //           fcmToken: null,
// //           wallet: {
// //             balance: 0,
// //             currency: "INR",
// //           },
// //           freeMinutesRemaining: 10,
// //         });
// //       }
// //       const token = await generateToken({
// //         userId:user?._id || null, 
// //         mobile: phone, 
// //         name:user?.name || null, 
// //         email:user?.email || null,
// //         // gender: user.gender,
// //         // city: user.city,
// //         // wallet: user.wallet,
// //         // profile: user.profile,
// //         // isVerfied: user.isVerified,
// //         // following: user.following,
// //         // fcmToken: user.fcmToken,
// //       });
// //       await UserDetail.updateOne({mobileNo:phone}, {$set:{token:token}});
// //       // await PhoneAuth.updateMany({phone:phone}, {$set:{token:token}});
// //       return res.status(200).json({
// //         success: true,
// //         message: "OTP verified successfully",
// //         data: {
// //           phone: phone,
// //           token: token,
// //           user: user ? user : null
// //         },
// //       });
// //     //   return res.status(200).json({
// //     //   success: true,
// //     //   message: "OTP verified successfully",
// //     //   data: {
// //     //     phone,
// //     //     token,
// //     //     user: user ? user : null
// //     //   },
// //     // });
// //     // }

// //     // if (existing) {
// //     //   // ✅ Find user (if already registered)
// //     //   const existingUser = await UserDetail.findOne({ mobileNo: phone });

// //     //   return res.status(200).json({
// //     //     success: true,
// //     //     message: "Phone number already verified",
// //     //     data: {
// //     //       phone: existing.phone,
// //     //       token: existing.token,
// //     //       user: existingUser ? existingUser : null
// //     //     },
// //     //   });
// //     // }

// //     // // ✅ Step 2: Verify OTP (static mock OTP = 1234)
// //     // if (otp !== "1234") {
// //     //   return res.status(400).json({
// //     //     success: false,
// //     //     message: "Invalid OTP",
// //     //   });
// //     // }

// //     // ✅ Step 3: Create a JWT-like token (no secret, no expiry)
// //     // const header = Buffer.from(
// //     //   JSON.stringify({ alg: "none", typ: "JWT" })
// //     // ).toString("base64url");

// //     // const payload = Buffer.from(
// //     //   JSON.stringify({ phone })
// //     // ).toString("base64url");

// //     // const payload = {

// //     //   phone
// //     // }

// //     // const token = `${header}.${payload}.`; // unsigned JWT-style token
// //     // const returnToken = await generateToken({ phone });
// //     // // ✅ Step 4: Save in DB
// //     // const newAuth = new PhoneAuth({ phone, token });
// //     // await newAuth.save();

// //     // // ✅ Step 5: Check if user already exists (after first verification)
// //     // const user = await UserDetail.findOne({ mobileNo: phone });

// //     // ✅ Step 6: Response
// //     // return res.status(200).json({
// //     //   success: true,
// //     //   message: "OTP verified successfully",
// //     //   data: {
// //     //     phone,
// //     //     token,
// //     //     user: user ? user : null
// //     //   },
// //     // });

// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Server Error",
// //       error: error.message,
// //     });
// //   }
// // };




// // exports.sendOtp = async (req, res) => {
// //   try {
// //     const { phone } = req.body;

// //     if (!phone) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Phone number is required",
// //       });
// //     }

// //     // Static OTP
// //     const otp = "1234";

// //     // Normally here you'd send SMS via Twilio, MSG91, etc.
// //     return res.status(200).json({
// //       success: true,
// //       message: `OTP sent successfully to ${phone}`,
// //       otp: otp, // 👈 In real app don’t send OTP in response
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: "Server Error",
// //       error: error.message,
// //     });
// //   }
// // };



//controllers/auth.controller.js
const crypto = require("crypto");
const PhoneAuth = require("../models/PhoneAuth");
const UserDetail = require("../models/UserDetail");
const { generateToken } = require("../utilis/jwt.utils");

/* ================= HELPER: Hash OTP ================= */
const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

/* ================= SEND OTP ================= */
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    // ✅ Validate phone format (basic E.164 check)
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Valid phone number is required",
      });
    }

    // ✅ Rate limit: block if OTP was sent less than 1 min ago
    const existing = await PhoneAuth.findOne({ phone });
    if (existing) {
      const secondsElapsed = (Date.now() - existing.createdAt) / 1000;
      if (secondsElapsed < 60) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(60 - secondsElapsed)}s before requesting a new OTP`,
        });
      }
    }

    // 🔥 Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // ⏳ Expiry (5 min)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 💾 Save HASHED OTP (never store plain OTP)
    await PhoneAuth.findOneAndUpdate(
      { phone },
      {
        otp: hashOtp(otp),
        expiresAt,
        createdAt: new Date(), // reset for rate limit tracking
      },
      { upsert: true, new: true }
    );

    // TODO: Replace console.log with real SMS service (Twilio, AWS SNS, etc.)
    console.log(`📲 OTP for ${phone}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ================= VERIFY OTP ================= */
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    const record = await PhoneAuth.findOne({ phone });

    // ✅ Generic message to avoid user enumeration
    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // ✅ Check expiry FIRST
    if (record.expiresAt < new Date()) {
      await PhoneAuth.deleteOne({ phone }); // cleanup expired record
      return res.status(400).json({
        success: false,
        message: "OTP has expired, please request a new one",
      });
    }

    // ✅ Timing-safe comparison using hashed OTP
    const hashedInput = hashOtp(otp);
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(record.otp),
      Buffer.from(hashedInput)
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ✅ Delete OTP record after successful verification
    await PhoneAuth.deleteOne({ phone });

    // 🔥 Find or create user
    let user = await UserDetail.findOne({ mobileNo: phone });
    const isNewUser = !user;

    if (!user) {
      user = await UserDetail.create({ mobileNo: phone });
    }

    // 🔐 Generate JWT — do NOT save token to DB
    const token = generateToken({
      userId: user._id,
      phone,
    });

    // ✅ Return clean user object without sensitive fields
    const userResponse = {
      _id: user._id,
      mobileNo: user.mobileNo,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        token,
        isNewUser, // useful for frontend to redirect to profile setup
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


