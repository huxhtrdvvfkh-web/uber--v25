require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const deliveryRoutes = require("./routes/delivery");
const courierRoutes = require("./routes/courier");

const socketHandler = require("./sockets");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// attach io globally
app.use((req, res, next) => {
  req.io = io;
  next();
});

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log("🚀 SERVER STARTING V-CLEAN");

// DB
connectDB();

// routes
app.use("/api/auth", authRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/courier", courierRoutes);

// socket
socketHandler(io);

// health
app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date() });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("🚀 RUNNING ON PORT", PORT);
});