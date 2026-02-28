const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../controllers/adminController');
const { upload } = require('../utilis/cloudinary'); // make sure this path is correct!

router.post('/register', upload.single('profile'), registerAdmin);
router.post('/login', loginAdmin);

module.exports = router;
