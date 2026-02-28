const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

router.get('/get-faqs', faqController.getAllFaqs);
router.get('/faqs/:id', faqController.getFaqById);
router.post('/add-faqs', faqController.createFaq);
router.put('/update-faqs/:id', faqController.updateFaq);
router.delete('/delete-faqs/:id', faqController.deleteFaq);

module.exports = router;
