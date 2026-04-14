module.exports = function socketHandler(io, Courier, Delivery, queue, redis) {
  io.on("connection", async (socket) => {

    socket.emit("init_couriers", await Courier.find());
    socket.emit("init_deliveries", await Delivery.find());

    socket.on("courier_ping", async (id) => {
      await Courier.findByIdAndUpdate(id, { lastSeen: new Date() });
    });

    socket.on("queue_status", () => {
      socket.emit("queue_info", {
        jobs: queue.length,
      });
    });

    socket.on("redis_status", async () => {
      socket.emit("redis_info", {
        system: redis ? await redis.get("system") : null,
      });
    });

  });
};