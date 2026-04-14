const fetch = global.fetch || require("node-fetch");

const jobQueue = [];

function createQueue(Courier, io, redis) {
  let running = true;

  async function worker() {
    while (running) {
      const job = jobQueue.shift();

      if (!job) {
        await new Promise(r => setTimeout(r, 200));
        continue;
      }

      try {
        if (job.type === "RETRY_DELIVERY") {
          await fetch("http://localhost:3000/delivery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(job.payload),
          });

          if (redis) {
            await redis.lpush("retry_queue", JSON.stringify(job.payload));
          }
        }

        if (job.type === "COURIER_SYNC") {
          const couriers = await Courier.find();
          io.emit("init_couriers", couriers);
        }

      } catch (e) {
        console.log("QUEUE ERROR:", e.message);
      }
    }
  }

  worker();

  return jobQueue;
}

module.exports = createQueue;