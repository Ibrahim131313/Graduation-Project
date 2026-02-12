const express = require("express");
const router = express.Router();
const controller = require("../controllers/readings_controller");
const { verifyToken, verify_A, verify_APND } = require("../middleware/verify_token");

// GET all readings (admin only)
router.route("/").get(verifyToken, verify_A, controller.getAllReadings);

// POST new reading from IoT device (no auth - devices send data directly)
router.route("/add").post(controller.addNewReading);

// GET readings by device ID
router.route("/:id").get(verifyToken, verify_APND, controller.getDevReadingById);

module.exports = router;
