module.exports = (io) => {

  // Track online users inside the socket module
  let onlineUsers = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Track user online
    socket.on("online", (user_id) => {
      onlineUsers[user_id] = socket.id;
      console.log("The user " + user_id + " is now online");
    });

    // Join conversation room
    socket.on("joinConversation", (conversation_id) => {
      socket.join(conversation_id);
      console.log(socket.id + " joined conversation:", conversation_id);
    });

    // Send message
    socket.on("sendMessage", async (data) => {
      try {
        console.log(socket.id, "sent a message:", data);

        const Message = require("../models/messages-model");
        const Conversation = require("../models/conversations-model");

        // Validate
        if (!data.conversation_id || !data.sender_id || !data.receiver_id || !data.message) {
          return socket.emit("errorMessage", { error: "Invalid message data" });
        }

        // Save message to DB
        await Message.create(data);

        await Conversation.findOneAndUpdate(
          { conversation_id: data.conversation_id },
          {
            last_message: data.message,
            updated_at: Date.now(),
          }
        );

        // Emit to all users in the room
        io.to(data.conversation_id).emit("receiveMessage", data);

      } catch (err) {
        console.error("Error in sendMessage:", err);
        socket.emit("errorMessage", { error: "Message could not be sent" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      // Remove user from online list
      onlineUsers = Object.fromEntries(
        Object.entries(onlineUsers).filter(([_, id]) => id !== socket.id)
      );
    });
  });

};
