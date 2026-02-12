const express = require("express");
const router = express.Router();
const controller = require("../controllers/staff_controller");
const { verifyToken, verify_RA, verify_A, verify_APND } = require("../middleware/verify_token");

router.route("/").get(verifyToken, verify_A, controller.getAllStaff);

router.route("/add").post(verifyToken, verify_A, controller.addNewStaffMem);

router.route("/doctors").get(verifyToken, verify_RA, controller.getDoctors);

router.route("/nurses").get(verifyToken, verify_A, controller.getNurses);

router.route("/receptionists").get(verifyToken, verify_A, controller.getReceptionists);

router
  .route("/:id")
  .get(verifyToken, controller.getStaffById)
  .delete(verifyToken, verify_A, controller.deleteStaffById)
  .patch(verifyToken, verify_A, controller.updateStaffById);

module.exports = router;
