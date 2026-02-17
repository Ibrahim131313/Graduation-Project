const Message = require("../models/messages-model");
const {DocPatConversation} = require("../models/conversations-model");

// Send a message (stores in DB)
const sendMessage = async (req, res) => {

  console.log("the api message hitted")
  const { conversation_id, sender_id, receiver_id, message } = req.body;
  try {
    let newMsg = await new Message({
	@@ -12,9 +14,10 @@ const sendMessage = async (req, res) => {
        "message": message 
        });


        await newMsg.save();
    // Update last_message in conversation
    await DocPatConversation.findOneAndUpdate({"conversation_id": conversation_id}, {
      last_message: message,
      updated_at: Date.now(),
    });
