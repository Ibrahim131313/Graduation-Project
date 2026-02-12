const express = require("express");
const { sendMessage, getMessages, markMessagesAsRead } = require("../controllers/messages_controller");
const {verifyToken} = require("../middleware/verify_token.js")

const router = express.Router();

router.post("/send", verifyToken,sendMessage);
router.get("/:conv_id", verifyToken,getMessages);
router.post("/read", verifyToken,markMessagesAsRead);

module.exports = router;
