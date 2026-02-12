const express = require("express");
const {verifyToken} = require("../middleware/verify_token.js")
const { getDocConversations } = require("../controllers/conversations_controller");

const router = express.Router();


router.route("/:doc_id")
     .get(verifyToken,getDocConversations);

module.exports = router;
