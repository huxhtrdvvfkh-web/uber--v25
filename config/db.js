const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://huxhtrdvvfkh:a1s2d3Aa@cluster0.segsski.mongodb.net/unicorn");
    console.log("✅ Mongo Connected");
  } catch (err) {
    console.log("❌ Mongo Error:", err.message);
  }
}

module.exports = connectDB;