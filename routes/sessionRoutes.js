// routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const { startSession, endSession } = require('../controllers/sessionController');

router.post('/start', startSession);
router.post('/end', endSession);

module.exports = router;
