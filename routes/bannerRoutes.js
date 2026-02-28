const express = require('express');
const router = express.Router();
const { upload } = require('../utilis/cloudinary'); // using your existing multer-cloudinary config
const { addBanners, getBanners,deleteBanners } = require('../controllers/bannerController');

// Upload multiple banner images
router.post('/add-banner', upload.array('images'), addBanners);

// Get banner images
router.get('/get-banner',getBanners);
router.delete('/banners/:id',deleteBanners);

module.exports = router;
