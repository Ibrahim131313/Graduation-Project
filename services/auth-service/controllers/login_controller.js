const Login = require("../models/login-model");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

/**
 * Create a new user
 */
const createUser = async (req, res) => {
  try {
    const { user_id, email, password, role } = req.body;
    let hashed_password = await bcrypt.hash(password, 6);
    let new_user = await new Login({
      user_id: user_id,
      email: email,
      password: hashed_password,
      role: role,
    });
    await new_user.save();
    res.status(201).json({ status: "success", data: { user: new_user } });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

/**
 * Authenticate user and return JWT token
 */
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    
    if (!email || !password) {
      // Use 400 Bad Request for missing fields
      return res.status(400).json({ 
        status: "fail", 
        message: "Email and password are required." 
      });
    }
    
    const user = await Login.findOne({ email: email });

    // SECURITY: Use generic error message - don't reveal if user exists or password is wrong
    if (!user) {
      return res.status(401).json({ 
        status: "fail", 
        message: "Invalid email or password." 
      });
    }
    
    const password_matched = await bcrypt.compare(password, user.password);
    if (!password_matched) {
      // SECURITY: Same generic error message for wrong password
      return res.status(401).json({ 
        status: "fail", 
        message: "Invalid email or password." 
      });
    }

    const token = await JWT.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "50d" }
    );
    
    res.json({
      status: "success",
      data: { token: token, user_id: user.user_id, role: user.role },
    });

    console.log("================================================");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred. Please try again.",
    });
  }
};

/**
 * Verify JWT token (for inter-service communication)
 */
const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ valid: false, message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ valid: false, message: "Token missing" });
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET_KEY);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(403).json({ valid: false, message: "Invalid or expired token" });
  }
};

module.exports = {
  authUser,
  createUser,
  verifyToken,
};
