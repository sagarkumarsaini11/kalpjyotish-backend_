const express = require('express');
const router = express.Router();
const { upload } = require('../utilis/cloudinary');

const poojaController = require('../controllers/poojaController');

router.post('/add-poojas', upload.single('image'), poojaController.createPooja);
router.get('/All-poojas', poojaController.getAllPoojas);
router.put('/update/:id', upload.single('image'), poojaController.updatePooja);
router.get('/poojas/:id', poojaController.getPoojaById);
router.delete('/delete-pooja/:id', poojaController.deletePooja);

module.exports = router;