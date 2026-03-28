const router = require("express").Router();
const ChatController = require("../controllers/chatController");

router.post("/chat", ChatController.startChat);
// User
router.get("/user/:id", ChatController.getUserById);

// Astrologer
router.get("/astrologer/:id", ChatController.getAstrologerById);



module.exports = router;
