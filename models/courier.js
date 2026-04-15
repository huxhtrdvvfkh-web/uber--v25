const mongoose = require("mongoose");

const CourierSchema = new mongoose.Schema({
  userId: String,
  lat: Number,
  lng: Number,
  status: String
});

module.exports = mongoose.model("Courier", CourierSchema);