const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  userId: String,
  courierId: String,
  lat: Number,
  lng: Number,
  status: { type: String, default: "pending" }
});

module.exports = mongoose.model("delivery", deliverySchema);