const mongoose = require("mongoose");

const DeliverySchema = new mongoose.Schema({
  userId: String,
  courierId: String,
  lat: Number,
  lng: Number,
  status: { type: String, default: "pending" }
});

module.exports = mongoose.model("Delivery", DeliverySchema);