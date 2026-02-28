const express = require('express');
const router = express.Router();
const dropdownCtrl = require('../controllers/dropdownController');

router.get('/astro_skills', dropdownCtrl.getDropdownOptions);
router.post('/new-dropdowns', dropdownCtrl.addDropdownItem);
router.put('/update-dropdowns/:id', dropdownCtrl.updateDropdownItem);
router.delete('/delete-dropdowns/:id', dropdownCtrl.deleteDropdownItem);

module.exports = router;
