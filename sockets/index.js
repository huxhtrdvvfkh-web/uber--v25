const Delivery = require("../models/delivery");

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("🔌 client connected");

    socket.on("courier_live", (data) => {
      io.emit("courier_live", data);
    });

    socket.on("accept_delivery", async (data) => {
      try {
        await Delivery.findByIdAndUpdate(data.deliveryId, {
          courierId: data.courierId,
          status: "accepted"
        });

        io.emit("delivery_assigned", data);
      } catch (err) {
        console.log("socket error:", err.message);
      }
    });
  });
};