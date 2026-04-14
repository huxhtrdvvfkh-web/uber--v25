const mongoose = require("mongoose");

const courierSchema = new mongoose.Schema({
  userId: String,
  lat: Number,
  lng: Number,
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model("courier", courierSchema);