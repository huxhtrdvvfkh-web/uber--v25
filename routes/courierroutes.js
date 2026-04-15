const express = require("express");
const Courier = require("../models/courier");

const router = express.Router();

router.post("/location", async (req, res) => {
  try {
    const { courierId, lat, lng } = req.body;

    await Courier.findOneAndUpdate(
      { userId: courierId },
      { lat, lng, status: "active" },
      { upsert: true }
    );

    req.io.emit("courier_live", { courierId, lat, lng });

    res.json({ ok: true });

  } catch (err) {
    res.status(500).json({ error: "courier update failed" });
  }
});

module.exports = router;