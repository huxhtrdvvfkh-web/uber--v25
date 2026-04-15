const Delivery = require("../models/delivery");

exports.createDelivery = async (req, res, io) => {
  try {
    const delivery = await delivery.create({
      userId: req.user.id,
      lat: req.body.lat,
      lng: req.body.lng,
      status: "pending"
    });

    io.emit("new_delivery", delivery);

    res.json(delivery);
  } catch {
    res.status(500).json({ error: "delivery failed" });
  }
};