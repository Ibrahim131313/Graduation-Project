const express = require("express")
const router = express.Router();
const controller = require("../controllers/other_controller")
const {verifyToken,  verify_AD, verify_APND} = require("../middleware/verify_token.js")



router.route("/doc/pats/:id")
     .get(verifyToken,verify_AD,controller.getDocPats)

module.exports = router ; 