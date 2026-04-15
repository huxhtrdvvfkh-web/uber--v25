const express = require("express");
const Delivery = require("../models/delivery");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const delivery = await Delivery.create({
      userId: req.user.id,
      lat: req.body.lat,
      lng: req.body.lng,
      status: "pending"
    });

    req.io.emit("new_delivery", delivery);

    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: "delivery failed" });
  }
});

module.exports = router;