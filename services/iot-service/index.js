/**
 * IoT Service - Smart Hospital System
 * Handles: Sensor Readings from Medical Devices
 * Port: 4003
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4003;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const readingsRouter = require("./routes/readings_router");

app.use("/api/readings", readingsRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "iot-service" });
});

// Database connection
const url = process.env.DATABASE_URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("✅ IoT Service: Connected to MongoDB");
    app.listen(port, () => {
      console.log(`📡 IoT Service running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ IoT Service: DB Connection Error:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 IoT Service: Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});
