const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require('http');
const {Server} = require('socket.io')
const socketHandeler = require('./sockets/socker_handler.js')
require('dotenv').config();

const url = process.env.DATABASE_URL ;

 
const app = express();
const port = 7000;


// Server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
socketHandeler(io);

// Middlewares
app.use(cors());
app.use(express.json()); // parse JSON bodies


// Routers
const patients_Router = require("./routers/patients_router");
const staff_Router = require("./routers/staff_router");
const readings_Router = require("./routers/readings_router");
const login_Router = require("./routers/Login_router");
const other_Router = require("./routers/other_router");

const conversations_Routes = require("./routers/conversations_router.js");
const messages_Routes = require("./routers/messages_router.js");

app.use("/api/patients/", patients_Router);
app.use("/api/staff/", staff_Router);
app.use("/api/readings/", readings_Router);
app.use("/api/login/", login_Router);
app.use("/api/other/", other_Router);

app.use("/api/conversations", conversations_Routes);
app.use("/api/messages", messages_Routes);

// Connect to MongoDB
mongoose.connect(url)
  .then(() => {
    console.log("✅ Connected to the DB");
    server.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => console.error("❌ DB Connection Error:", err));