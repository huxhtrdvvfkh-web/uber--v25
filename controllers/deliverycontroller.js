const Delivery = require("../models/delivery");

exports.createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create({
      userId: req.user.id,
      lat: req.body.lat,
      lng: req.body.lng,
      status: "pending"
    });

    res.json(delivery);
  } catch {
    res.status(500).json({ error: "delivery failed" });
  }
};