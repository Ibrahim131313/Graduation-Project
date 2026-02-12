const express = require("express");
const router = express.Router();
const controller = require("../controllers/login_controller");

// POST /api/login - Authenticate user
router.route("/").post(controller.authUser);

// POST /api/login/add - Create new user
router.route("/add").post(controller.createUser);

// GET /api/login/verify - Verify token (for inter-service auth)
router.route("/verify").get(controller.verifyToken);

module.exports = router;
