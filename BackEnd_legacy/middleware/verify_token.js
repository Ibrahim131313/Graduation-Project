const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]; // must be lowercase
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // verify token
    req.logined_user = decoded; // store decoded data in request
    next(); // pass control to next middleware
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};


const verify_RA = async (req, res, next) => {
  const role = req.logined_user.role; 
  // console.log({"role": role})       ////////////////////
  if (!role) {
    return res.status(401).json({ message: "the user role unknown" });
  }

  try {
    if(role == "receptionist" || role == "admin"){
      next(); // pass control to next middleware
    }
  } catch (err) {
    return res.status(403).json({ message: "not receptionist" });
  }
};


const verify_A = async (req, res, next) => {
  const role = req.logined_user.role; 
  // console.log({"role": role})       ////////////////////
  if (!role) {
    return res.status(401).json({ message: "the user role unknown" });
  }

  try {
    if(role == "admin"){
      next(); // pass control to next middleware
    }
  } catch (err) {
    return res.status(403).json({ message: "not admin" });
  }
};



const verify_APND = async (req, res, next) => {
  const role = req.logined_user.role; 
  // console.log({"role": role})       ////////////////////
  if (!role) {
    return res.status(401).json({ message: "the user role unknown" });
  }

  try {
    if(role == "admin" || role == "patient" || role == "nurse" || role == "doctor"){
      next(); // pass control to next middleware
    }
  } catch (err) {
    return res.status(403).json({ message: "you are not allowed to access" });
  }
};


const verify_AD = async (req, res, next) => {
  const role = req.logined_user.role; 
  // console.log({"role": role})       ////////////////////
  if (!role) {
    return res.status(401).json({ message: "the user role unknown" });
  }

  try {
    if(role == "admin" || role == "doctor"){
      next(); // pass control to next middleware
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
  verify_AD
};