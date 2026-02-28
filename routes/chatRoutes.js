const router = require("express").Router();
const ChatController = require("../controllers/chatController");

router.post("/chat", ChatController.startChat);


module.exports = router;
