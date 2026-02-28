const express = require("express");
const router = express.Router();
const transitController = require("../controllers/transit.controller");

router.get("/get-trasnsit", transitController.getTransits);    
router.get("/get-planet-transits", transitController.getPlanetTransits);

module.exports = router;
