require("dotenv").config();

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");


const user = require("./models/user");
const delivery = require("./models/delivery");
const courier = require("./models/courier");
const auth = require("./middleware/auth");

// ✅ NEW ROUTES
const authroutes = require("./routes/authroutes");
const deliveryroutes = require("./routes/deliveryroutes");
const courierroutes = require("./routes/courierroutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// =========================
// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ✅ NEW ROUTES USAGE
app.use("/api/auth", authroutes);
app.use("/api/delivery", deliveryroutes);
app.use("/api/courier", courierroutes);

console.log("🚀 V55 DEPLOY READY STARTING");

// =========================
// SAFE MONGO CONNECT
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Mongo Connected"))
  .catch(err => {
    console.log("❌ Mongo Error:", err.message);
    console.log("⚠️ Running WITHOUT DB CRASH");
  });

// =========================
// MAPS KEY
app.get("/api/maps-key", (req, res) => {
  res.json({ key: process.env.GOOGLE_MAPS_API_KEY });
});

// =========================
// ❌ OLD ROUTES (DISABLED)

/*
app.post("/register", async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hash,
      role: req.body.role || "user"
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "register failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ error: "not found" });

    const ok = await bcrypt.compare(req.body.password, user.password);
    if (!ok) return res.json({ error: "wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ token, user });

  } catch (err) {
    res.status(500).json({ error: "login failed" });
  }
});

function safeAuth(req, res, next) {
  try {
    return auth(req, res, next);
  } catch (err) {
    return res.status(401).json({ error: "auth failed" });
  }
}

app.post("/delivery", safeAuth, async (req, res) => {
  try {
    if (!req.body.lat || !req.body.lng) {
      return res.status(400).json({ error: "missing coordinates" });
    }

    const delivery = await Delivery.create({
      userId: req.user.id,
      lat: req.body.lat,
      lng: req.body.lng,
      status: "pending"
    });

    io.emit("new_delivery", delivery);

    res.json(delivery);

  } catch (err) {
    res.status(500).json({ error: "delivery failed" });
  }
});

app.post("/courier/location", async (req, res) => {
  try {
    const { courierId, lat, lng } = req.body;

    if (!courierId) {
      return res.status(400).json({ error: "missing courierId" });
    }

    await Courier.findOneAndUpdate(
      { userId: courierId },
      { lat, lng, status: "active" },
      { upsert: true }
    );

    io.emit("courier_live", { id: courierId, lat, lng });

    res.json({ ok: true });

  } catch (err) {
    res.status(500).json({ error: "courier update failed" });
  }
});
*/

// =========================
// SOCKET
io.on("connection", (socket) => {
  console.log("🔌 client connected");

  socket.on("error", (err) => {
    console.log("Socket error:", err.message);
  });

  socket.on("courier_live", (data) => {
    if (!data?.id) return;
    io.emit("courier_live", data);
  });

  socket.on("accept_delivery", async (data) => {
    try {
      await Delivery.findByIdAndUpdate(data.deliveryId, {
        courierId: data.courierId,
        status: "accepted"
      });

      io.emit("delivery_assigned", data);

    } catch (err) {
      console.log("accept_delivery error:", err.message);
    }
  });
});

// =========================
// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString()
  });
});

// =========================
// START SERVER
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("🚀 V55 DEPLOY READY RUNNING ON PORT", PORT);
});