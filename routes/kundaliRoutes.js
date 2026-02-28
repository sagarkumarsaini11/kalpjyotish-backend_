const express = require('express');
const router = express.Router();
const kundaliController = require('../controllers/kundaliController');

router.post('/add-kundali', kundaliController.createKundaliForm);
router.get('/get-kundali', kundaliController.getAllKundaliForms);
router.get('/get-kundalbyID/:id', kundaliController.getKundaliFormById);
router.patch('/update-kundali/:id', kundaliController.updateKundaliForm);
router.delete('/delete-kundali/:id', kundaliController.deleteKundaliForm);

module.exports = router;
