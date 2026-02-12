const mongoose = require("mongoose");
const validator = require("validator");

const patientSchema = new mongoose.Schema(
  {
    patient_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 0, max: 120 },
    gender: { type: String, enum: ["male", "female"], required: true },
    device_id: { type: String, required: true, unique: true },
    doctor_id: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: [true, "the email is already used"],
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "please enter a valid email"],
    },
  },
  { timestamps: true },
  { _id: false }
);

module.exports = mongoose.model("Patients", patientSchema);
