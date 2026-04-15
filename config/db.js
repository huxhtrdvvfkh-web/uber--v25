const mongoose = require("mongoose");

module.exports = function connectDB() {
  mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("✅ Mongo Connected"))
    .catch(err => console.log("❌ Mongo Error:", err.message));
};