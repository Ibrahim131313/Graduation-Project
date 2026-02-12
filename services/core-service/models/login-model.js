const mongoose = require("mongoose");
const validator = require("validator");

const loginSchema = new mongoose.Schema({
  user_id: { type: String, unique: true, index: true },
  email: {
    type: String,
    required: true,
    unique: [true, "the email is already used"],
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "please enter a valid email"],
  },
  password: { type: String },
  role: { type: String },
});

module.exports = mongoose.model("Login", loginSchema);
