const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversation_id: { type: String, required: true },
  sender_id: { type: String, required: true },
  receiver_id: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
}
);

module.exports = mongoose.model("Message", messageSchema);
