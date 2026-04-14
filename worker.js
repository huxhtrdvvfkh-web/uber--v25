require("dotenv").config();

console.log("🚀 Worker FIXED started");

let redis = null;
const queueKey = "delivery_queue";

try {
  const { Redis } = require("@upstash/redis");

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    console.log("✅ Worker Redis connected");
  } else {
    console.log("⚠️ Worker running without Redis");
  }
} catch {
  console.log("⚠️ Redis package not installed");
}

// =========================
async function processJob(job) {
  console.log("📦 Processing job:", job);

  await new Promise((r) => setTimeout(r, 500));

  console.log("✅ Done job");
}

// =========================
setInterval(async () => {
  try {
    if (!redis) return;

    const job = await redis.lpop(queueKey);

    if (job) {
      await processJob(JSON.parse(job));
    }

  } catch (err) {
    console.log("❌ Worker error:", err.message);
  }
}, 1000);