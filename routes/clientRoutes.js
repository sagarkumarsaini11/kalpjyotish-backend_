// routes/clientRoutes.js
const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const { upload } = require("../utilis/cloudinary");
const { authMiddleware } = require('../middleware/auth.middleware');

// Signup route
router.post(
  "/signup",
  upload.single("profile"), 
  clientController.signup
);

router.get("/:id", clientController.getClientById);
router.get("/user-details/get",authMiddleware, clientController.getUserDetails);

router.put("/update/:id", upload.single("profile"), clientController.updateClient);

// ✅ Delete client by ID
router.delete("/delete/:id", clientController.deleteClient);
module.exports = router;
