const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  conversation_id: { type: String, unique: true, required: true },
  doctor_id: { type: String, required: true },
  patient_id: { type: String, required: true },
  patient_name:{ type: String, required: true },
  last_message: { type: String },
  updated_at: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Conversation", conversationSchema);
