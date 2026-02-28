const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { upload } = require('../utilis/cloudinary');
const { getUserStats,getUserList,sendOTP,verifyOTP} = require('../controllers/authController');


router.post('/signup', upload.single('profile'), authController.signup);
router.post('/login', authController.login);
router.post('/social-login', authController.socialLogin);
router.put('/update/:id', upload.single('profile'), authController.updateUser);
router.get('/user-stats', getUserStats);
router.get('/users', getUserList);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.put('/update-fcm/:id',authController.updateFcmToken);
router.get('/:id', authController.getUserById);

module.exports = router;



