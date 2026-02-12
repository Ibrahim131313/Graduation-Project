const mongoose = require("mongoose");
const validator = require("validator");

const StaffSchema = new mongoose.Schema(
  {
    staff_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 0, max: 120 },
    gender: { type: String, enum: ["male", "female"], required: true },
    email: {
      type: String,
      required: true,
      unique: [true, "the email is already used"],
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "please enter a valid email"],
    },
    role: {
      type: String,
      enum: ["doctor", "nurse", "receptionist"],
      required: true,
    },
  },
  { timestamps: true },
  { _id: false }
);

module.exports = mongoose.model("Staff", StaffSchema);
