const express = require("express")
const router = express.Router();
const controller = require("../controllers/staff_controller")
const {  verifyToken,verify_RA,verify_A,verify_APND} = require("../middleware/verify_token.js")


router.route("/")   // allowed for all
     .get(verifyToken,verify_A,controller.getAllStaff)  //  
     

router.route("/add")   //
     .post(verifyToken,verify_A,controller.addNewStaffMem);  //    



router.route("/doctors")   // allowed for receptionist 
     .get(verifyToken,verify_RA,controller.getDoctors);  //     verifyToken,verify_RA,

router.route("/nurses")   // allowed for receptionist 
     .get(verifyToken,verify_A,controller.getNurses);  //     verifyToken,verify_RA,

router.route("/receptionists")   // allowed for receptionist 
     .get(verifyToken,verify_A,controller.getReceptionists);  //     verifyToken,verify_RA,

     
router.route("/:id")
     .get(verifyToken,controller.getStaffById)   //    verifyToken,
     .delete(verifyToken,verify_A,controller.deleteStaffById)   //     verifyToken,
     .patch(verifyToken,verify_A,controller.updateStaffById)    //      verifyToken,


module.exports = router ; 