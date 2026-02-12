/**
 * Core Service - Smart Hospital System
 * Handles: Staff CRUD, Patients CRUD, Doctor-specific endpoints
 * Port: 4002
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const staffRouter = require("./routes/staff_router");
const patientsRouter = require("./routes/patients_router");
const otherRouter = require("./routes/other_router");

app.use("/api/staff", staffRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/other", otherRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "core-service" });
});

// Database connection
const url = process.env.DATABASE_URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("✅ Core Service: Connected to MongoDB");
    app.listen(port, () => {
      console.log(`🏥 Core Service running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Core Service: DB Connection Error:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 Core Service: Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});
