const express = require("express")
const router = express.Router();
const controller = require("../controllers/login_controller")



router.route("/")
     .post(controller.authUser)

router.route("/add")   
     .post(controller.createUser)
     

module.exports = router ; 