module.exports = function createMovement(io, Courier, Delivery, helpers) {
  return async function moveCourier(courier, delivery) {
    const route = [
      { lat: courier.lat, lng: courier.lng },
      { lat: delivery.lat, lng: delivery.lng }
    ];

    let i = 0;
    let lastEmit = 0;

    const interval = setInterval(async () => {
      if (i >= route.length) {
        courier.available = true;
        courier.activeDeliveries = Math.max(0, courier.activeDeliveries - 1);

        await courier.save();

        delivery.status = "delivered";
        await delivery.save();

        io.to("tracking").emit("delivery_done", delivery);
        clearInterval(interval);
        return;
      }

      const next = route[i];

      courier.lat = next.lat;
      courier.lng = next.lng;
      courier.speed = 0.8 + Math.random() * 2;

      await courier.save();

      const remaining = route.length - i;
      const eta = helpers.etaCalc(remaining, courier.speed);

      if (Date.now() - lastEmit > 80) {
        io.to("tracking").emit("courier_update", courier);
        io.to("tracking").emit("eta_update", { _id: delivery._id, eta });
        lastEmit = Date.now();
      }

      i++;
    }, 120);
  };
};