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

const { getdistance } = require("./utils/distance");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["get", "post"] }
});

// =========================
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log("🚀 v56 uber system starting");

// =========================
// mongo
mongoose.connect(process.env.mongo_url)
  .then(() => console.log("✅ mongo connected"))
  .catch(err => console.log("❌ mongo error:", err.message));

// =========================
// socket rooms
io.on("connection", (socket) => {
  console.log("🔌 client connected");

  socket.on("join", (userid) => {
    socket.join(userid);
  });

  socket.on("disconnect", () => {});
});

// =========================
// maps key
app.get("/api/maps-key", (req, res) => {
  res.json({ key: process.env.google_maps_api_key });
});

// =========================
// register
app.post("/register", async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);

    const newuser = await user.create({
      name: req.body.name,
      email: req.body.email,
      password: hash,
      role: req.body.role || "user"
    });

    res.json(newuser);
  } catch (err) {
    res.status(500).json({ error: "register failed" });
  }
});

// =========================
// login
app.post("/login", async (req, res) => {
  try {
    const u = await user.findOne({ email: req.body.email });
    if (!u) return res.json({ error: "not found" });

    const ok = await bcrypt.compare(req.body.password, u.password);
    if (!ok) return res.json({ error: "wrong password" });

    const token = jwt.sign(
      { id: u._id, role: u.role },
      process.env.jwt_secret
    );

    res.json({ token, user: u });

  } catch (err) {
    res.status(500).json({ error: "login failed" });
  }
});

// =========================
function safeauth(req, res, next) {
  try {
    return auth(req, res, next);
  } catch {
    return res.status(401).json({ error: "auth failed" });
  }
}

// =========================
// delivery smart match
app.post("/delivery", safeauth, async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: "missing coords" });
    }

    const d = await delivery.create({
      userid: req.user.id,
      lat,
      lng,
      status: "pending"
    });

    const couriers = await courier.find({ status: "active" });

    let closest = null;
    let mindist = 999999;

    for (let c of couriers) {
      const dist = getdistance(lat, lng, c.lat, c.lng);
      if (dist < mindist) {
        mindist = dist;
        closest = c;
      }
    }

    if (closest) {
      io.to(closest.userid).emit("new_delivery", d);
    } else {
      io.emit("new_delivery", d);
    }

    res.json(d);

  } catch (err) {
    res.status(500).json({ error: "delivery failed" });
  }
});

// =========================
// courier location
app.post("/courier/location", async (req, res) => {
  try {
    const { courierid, lat, lng } = req.body;

    if (!courierid) {
      return res.status(400).json({ error: "missing courierid" });
    }

    await courier.findOneAndUpdate(
      { userid: courierid },
      { userid: courierid, lat, lng, status: "active" },
      { upsert: true }
    );

    io.emit("courier_live", { id: courierid, lat, lng });

    res.json({ ok: true });

  } catch (err) {
    res.status(500).json({ error: "courier update failed" });
  }
});

// =========================
// socket actions
io.on("connection", (socket) => {

  socket.on("accept_delivery", async (data) => {
    try {
      await delivery.findByIdAndUpdate(data.deliveryid, {
        courierid: data.courierid,
        status: "accepted"
      });

      io.emit("delivery_assigned", data);

    } catch (err) {
      console.log(err.message);
    }
  });

});

// =========================
// health
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// =========================
const port = process.env.port || 3000;
server.listen(port, () => {
  console.log("🚀 running on port", port);
});