const express = require("express");
const router = express.Router();
const controller = require("../controllers/patients_controller");
const { verifyToken, verify_RA } = require("../middleware/verify_token");

router.route("/").get(verifyToken, controller.getAllPatients);

router.route("/add").post(verifyToken, controller.addNewPatient);

router
  .route("/:id")
  .get(verifyToken, controller.getPatientById)
  .delete(verifyToken, verify_RA, controller.deletePatientById)
  .patch(verifyToken, verify_RA, controller.updatePatient);

module.exports = router;
