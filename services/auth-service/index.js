/**
 * Auth Service - Smart Hospital System
 * Handles: Authentication, User Registration, Token Management
 * Port: 4001
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const loginRouter = require("./routes/login_router");

app.use("/api/login", loginRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "auth-service" });
});

// Database connection
const url = process.env.DATABASE_URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("✅ Auth Service: Connected to MongoDB");
    app.listen(port, () => {
      console.log(`🔐 Auth Service running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Auth Service: DB Connection Error:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 Auth Service: Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});
