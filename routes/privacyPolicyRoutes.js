const express = require('express');
const router = express.Router();
const {
  getPrivacyPolicy,
  addPrivacyPolicy,
  updatePrivacyPolicy,
  deletePrivacyPolicy
} = require('../controllers/privacyPolicyController');

router.get('/get-privacy-policy', getPrivacyPolicy);
router.post('/add-privacy-policy', addPrivacyPolicy);
router.patch('/update-privacy-policy/:id', updatePrivacyPolicy);
router.delete('/delete-privacy-policy/:id', deletePrivacyPolicy);

module.exports = router;
