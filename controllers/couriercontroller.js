const Courier = require("../models/courier");

exports.updatecourier = async (req, res, io) => {
  try {
    const { courierId, lat, lng } = req.body;

    await Courier.findOneAndUpdate(
      { userId: courierId },
      { lat, lng, status: "active" },
      { upsert: true }
    );

    io.emit("courier_live", { id: courierId, lat, lng });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "courier update failed" });
  }
};