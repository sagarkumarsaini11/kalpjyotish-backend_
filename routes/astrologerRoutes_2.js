const express = require("express");
const router = express.Router();

const {
  createAstrologer,
  getAllAstrologers,
  updateAstrologer,
  deleteAstrologer,
  getAstrologer,
  // other handlers...
} = require("../controllers/astrologerController_2");

const { astrologerUploads } = require("../utilis/cloudinary");

// Debug middleware (optional) logs body & files
const debugUploads = (req, res, next) => {
  console.log("=== incoming upload ===");
  console.log("body:", req.body);
  console.log("files:", (req.files || []).map(f => ({ fieldname: f.fieldname, originalname: f.originalname })));
  next();
};

router.post("/register", astrologerUploads, debugUploads, createAstrologer);


// READ
router.get("/all", getAllAstrologers);
router.get("/single/:id", getAstrologer);

// UPDATE
router.put("/update/:id", astrologerUploads, updateAstrologer);

// DELETE
router.delete("/delete/:id", deleteAstrologer);

module.exports = router;
