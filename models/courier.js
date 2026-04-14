const mongoose = require("mongoose");

const CourierSchema = new mongoose.Schema({
  userId: String,
  lat: Number,
  lng: Number,
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model("Courier", CourierSchema);