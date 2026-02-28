const express = require("express");
const router = express.Router();
const { followUnfollowAstrologer } = require("../controllers/followController");

// PATCH API
router.patch("/follow-astrologer", followUnfollowAstrologer);

module.exports = router;
