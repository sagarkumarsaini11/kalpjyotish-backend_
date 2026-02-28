// const UserDetail = require("../models/UserDetail");
// const { generateToken } = require("../utilis/jwt.utils");

// exports.firebaseLogin = async (req, res) => {
//   try {
//     const { phone, firebaseUid, name } = req.body;

//     if (!phone || !firebaseUid) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone and firebaseUid required",
//       });
//     }

//     // 🔍 Step 1: Find user
//     let user = await UserDetail.findOne({ mobileNo: phone });

//     let isNewUser = false;

//     // 🆕 Step 2: Create user if not exists (SIGNUP)
//     if (!user) {
//       user = await UserDetail.create({
//         mobileNo: phone,
//         name: name || "User",
//         firebaseUid: firebaseUid,
//         isVerified: true,
//         wallet: {
//           balance: 0,
//           currency: "INR",
//         },
//         freeMinutesRemaining: 10,
//       });

//       isNewUser = true;
//       console.log("🆕 New user created (Signup)");
//     } else {
//       // 🔄 Optional: update firebaseUid if changed
//       if (!user.firebaseUid) {
//         user.firebaseUid = firebaseUid;
//       }

//       console.log("✅ Existing user login");
//     }

//     // 🔐 Step 3: Generate JWT
//     const token = generateToken({
//       userId: user._id,
//       phone: phone,
//     });

//     // 💾 Step 4: Save token
//     user.token = token;
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: isNewUser
//         ? "Signup successful"
//         : "Login successful",
//       data: {
//         user,
//         token,
//         isNewUser, // 🔥 useful for frontend
//       },
//     });
//   } catch (error) {
//     console.error("Firebase Login Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };









// const admin = require("../config/fcm");
// const UserDetail = require("../models/UserDetail");
// const { generateToken } = require("../utilis/jwt.utils");

// exports.firebaseLogin = async (req, res) => {
//   try {
//     const { idToken, name } = req.body;

//     if (!idToken) {
//       return res.status(400).json({
//         success: false,
//         message: "idToken required",
//       });
//     }

//     // 🔐 VERIFY FIREBASE TOKEN
//     const decodedToken = await admin.auth().verifyIdToken(idToken);

//     const phone = decodedToken.phone_number;
//     const firebaseUid = decodedToken.uid;

//     if (!phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone not found",
//       });
//     }

//     // 🔍 Find user
//     let user = await UserDetail.findOne({ mobileNo: phone });

//     let isNewUser = false;

//     // 🆕 Create if not exists
//     if (!user) {
//       user = await UserDetail.create({
//         mobileNo: phone,
//         name: name || "User",
//         firebaseUid,
//         isVerified: true,
//         wallet: {
//           balance: 0,
//           currency: "INR",
//         },
//         freeMinutesRemaining: 10,
//       });

//       isNewUser = true;
//     } else {
//       // update firebaseUid if missing
//       if (!user.firebaseUid) {
//         user.firebaseUid = firebaseUid;
//       }
//     }

//     // 🔐 Generate token
//     const token = generateToken({
//       userId: user._id,
//       phone,
//     });

//     user.token = token;
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: isNewUser ? "Signup successful" : "Login successful",
//       data: { user, token, isNewUser },
//     });
//   } catch (error) {
//     console.error("🔥 FULL ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message, // 👈 IMPORTANT
//     });
//   }
// };




// const admin = require("../config/fcm");
// const UserDetail = require("../models/UserDetail");
// const { generateToken } = require("../utilis/jwt.utils");

// exports.firebaseLogin = async (req, res) => {
//   try {
//     const { idToken, name } = req.body;

//     if (!idToken) {
//       return res.status(400).json({
//         success: false,
//         message: "idToken required",
//       });
//     }

//     // 🔥 VERIFY TOKEN
//     const decodedToken = await admin.auth().verifyIdToken(idToken);

//     const phone = decodedToken.phone_number;
//     const firebaseUid = decodedToken.uid;

//     if (!phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone not found in token",
//       });
//     }

//     // 🔍 Find user
//     let user = await UserDetail.findOne({ mobileNo: phone });

//     let isNewUser = false;

//     // 🆕 Create user
//     if (!user) {
//       user = await UserDetail.create({
//         mobileNo: phone,
//         name: name || "User",
//         firebaseUid,
//         isVerified: true,
//         wallet: {
//           balance: 0,
//           currency: "INR",
//         },
//         freeMinutesRemaining: 10,
//       });

//       isNewUser = true;
//     } else {
//       // update UID if missing
//       if (!user.firebaseUid) {
//         user.firebaseUid = firebaseUid;
//       }
//     }

//     // 🔐 JWT
//     const token = generateToken({
//       userId: user._id,
//       phone,
//     });

//     user.token = token;
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: isNewUser ? "Signup success" : "Login success",
//       data: {
//         user,
//         token,
//         isNewUser,
//       },
//     });
//   } catch (error) {
//     console.error("🔥 Firebase Login Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



// const admin = require("../config/fcm");
// const UserDetail = require("../models/UserDetail");
// const { generateToken } = require("../utilis/jwt.utils");

// /* ================= FIREBASE LOGIN ================= */
// exports.firebaseLogin = async (req, res) => {
//   try {
//     const { idToken } = req.body;

//     if (!idToken) {
//       return res.status(400).json({
//         success: false,
//         message: "idToken required",
//       });
//     }

//     // ✅ Verify Firebase token
//     const decodedToken = await admin.auth().verifyIdToken(idToken);

//     const phone = decodedToken.phone_number;

//     if (!phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone number not found in token",
//       });
//     }

//     // ✅ Normalize phone
//     const cleanPhone = phone.replace(/\D/g, "").slice(-10);

//     // 🔥 Find or create user
//     let user = await UserDetail.findOne({ mobileNo: cleanPhone });

//     if (!user) {
//       user = await UserDetail.create({
//         mobileNo: cleanPhone,
//         isVerified: true,
//       });
//     }

//     // 🔐 Generate JWT (your app token)
//     const token = generateToken({
//       userId: user._id,
//       phone: cleanPhone,
//     });

//     user.token = token;
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       data: {
//         token,
//         user,
//       },
//     });
//   } catch (error) {
//     console.error("Firebase Login Error:", error);

//     return res.status(401).json({
//       success: false,
//       message: "Invalid Firebase token",
//     });
//   }
// };





const admin = require("../config/fcm");
const UserDetail = require("../models/UserDetail");
const { generateToken } = require("../utilis/jwt.utils");

/* ================= FIREBASE AUTH ================= */
exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken, firebaseUid, phone } = req.body;

    // ✅ Validate input
    if (!idToken || !firebaseUid || !phone) {
      return res.status(400).json({
        success: false,
        message: "idToken, firebaseUid and phone are required in request body",
      });
    }

    // ✅ Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // console.log("decodedToken", decodedToken);
    // 🔒 Check UID match
    if (decodedToken.uid !== firebaseUid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Firebase UID",
      });
    }

    // 🔒 Extract phone from Firebase token
    const firebasePhone = decodedToken.phone_number;

    if (!firebasePhone) {
      return res.status(400).json({
        success: false,
        message: "Phone not found in Firebase token",
      });
    }

    // ✅ Normalize both phones
    const cleanFrontendPhone = phone.replace(/\D/g, "").slice(-10);
    const cleanFirebasePhone = firebasePhone.replace(/\D/g, "").slice(-10);

    // 🔒 Match phone (VERY IMPORTANT)
    if (cleanFrontendPhone !== cleanFirebasePhone) {
      return res.status(401).json({
        success: false,
        message: "Phone number mismatch",
      });
    }

    // 🔥 Find or Create User
    let user = await UserDetail.findOne({ mobileNo: cleanFrontendPhone });

    if (!user) {
      console.log("Creating new user", cleanFrontendPhone, firebaseUid);
      user = await UserDetail.create({
        mobileNo: cleanFrontendPhone,
        firebaseUid,
        isVerified: true,
      });
    }

    // 🔐 Generate your app JWT
    const token = generateToken({
      userId: user._id,
      phone: cleanFrontendPhone,
    });

    // (optional) store token
    user.token = token;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Authentication successful",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    console.error("Firebase Auth Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired Firebase token in " + error.message,
    });
  }
};