const express = require("express")
const router = express.Router();
const controller = require("../controllers/patients_controller")
const {verifyToken, verify_RA} = require("../middleware/verify_token.js")


router.route("/")   // allowed for all
     .get(verifyToken,controller.getAllPatients)  //     verifyToken,
     

router.route("/add")   // allowed for receptionist 
     .post(verifyToken,controller.addNewPatient);  //     verifyToken,verify_RA,


router.route("/:id")
     .get(verifyToken,controller.getPatientById)   //    verifyToken,
     .delete(verifyToken,verify_RA,controller.deletePatientById)   //     verifyToken,verify_RA,
     .patch(verifyToken,verify_RA,controller.updatePatient)    //      verifyToken,verify_RA,


module.exports = router ; 