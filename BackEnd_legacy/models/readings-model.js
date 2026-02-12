// models/Reading.js
const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  heart_rate: Number,
  spo2: Number,
  temperature: Number,
  respiration_rate: Number,
  respiration_pattern: String
}, { _id: false });

const readingsSchema = new mongoose.Schema({    //   patient_id: { type: String, required: true },
  device_id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  sensors: sensorSchema
});

module.exports = mongoose.model('Readings', readingsSchema);