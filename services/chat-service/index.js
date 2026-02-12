/**
 * Chat Service - Smart Hospital System
 * Handles: Real-time Messaging, Conversations via Socket.io
 * Port: 4004
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./sockets/socket_handler");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4004;

// Create HTTP server and Socket.io instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Initialize socket handler
socketHandler(io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const conversationsRouter = require("./routes/conversations_router");
const messagesRouter = require("./routes/messages_router");

app.use("/api/conversations", conversationsRouter);
app.use("/api/messages", messagesRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "chat-service" });
});

// Database connection
const url = process.env.DATABASE_URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("✅ Chat Service: Connected to MongoDB");
    server.listen(port, () => {
      console.log(`💬 Chat Service running on port ${port}`);
      console.log(`🔌 Socket.io ready for connections`);
    });
  })
  .catch((err) => {
    console.error("❌ Chat Service: DB Connection Error:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 Chat Service: Shutting down gracefully...");
  io.close();
  await mongoose.connection.close();
  process.exit(0);
});
