const jwt = require("jsonwebtoken");

/**
 * Verify JWT token middleware
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.logined_user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/**
 * Verify Receptionist or Admin role
 */
const verify_RA = async (req, res, next) => {
  const role = req.logined_user.role;
  if (!role) {
    return res.status(401).json({ message: "the user role unknown" });
  }

  try {
    if (role == "receptionist" || role == "admin") {
      next();
    } else {
      return res.status(403).json({ message: "not authorized" });
    }
  } catch (err) {
    return res.status(403).json({ message: "not receptionist" });
  }
};

/**
 * Verify Admin role only
 */
const verify_A = async (req, res, next) => {
  const role = req.logined_user.role;
  if (!role) {
    return res.status(401).json({ message: "the user role unknown" });
  }

  try {
    if (role == "admin") {
      next();
    } else {
      return res.status(403).json({ message: "not authorized" });
    }
  } catch (err) {
    return res.status(403).json({ message: "not admin" });
  }
};

/**
 * Verify Admin, Patient, Nurse, or Doctor role
 */
const verify_APND = async (req, res, next) => {
  const role = req.logined_user.role;
  if (!role) {
    return res.status(401).json({ message: "the user role unknown" });
  }

  try {
    if (role == "admin" || role == "patient" || role == "nurse" || role == "doctor") {
      next();
    } else {
      return res.status(403).json({ message: "not authorized" });
    }
  } catch (err) {
    return res.status(403).json({ message: "you are not allowed to access" });
  }
};

/**
 * Verify Admin or Doctor role
 */
const verify_AD = async (req, res, next) => {
  const role = req.logined_user.role;
  if (!role) {
    return res.status(401).json({ message: "the user role unknown" });
  }

  try {
    if (role == "admin" || role == "doctor") {
      next();
    } else {
      return res.status(403).json({ message: "not authorized" });
    }
  } catch (err) {
    return res.status(403).json({ message: "you are not allowed to access" });
  }
};

module.exports = {
  verifyToken,
  verify_RA,
  verify_A,
  verify_APND,
  verify_AD,
};
