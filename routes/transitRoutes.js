const express = require('express');
const router = express.Router();
const transitController = require('../controllers/transitController');
const { upload } = require('../utilis/cloudinary'); // Adjust path as needed

router.post('/add-trasnsit', upload.single('image'), transitController.createTransit);
router.get('/get-trasnsit', transitController.getAllTransits);
router.get('/update-trasnsit/:id', transitController.getTransitById);
router.patch('/update-trasnsit/:id', upload.single('image'), transitController.updateTransit);
router.delete('/delete-trasnsit/:id', transitController.deleteTransit);

module.exports = router;
