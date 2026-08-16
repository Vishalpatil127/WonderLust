const redis = require("redis");
const env = require("./env");
const logger = require("./logger");

let client = null;
let isConnected = false;

if (env.REDIS_URL) {
  client = redis.createClient({ url: env.REDIS_URL });

  client.on("error", (err) => logger.error("Redis error:", err.message));
  client.on("connect", () => { isConnected = true; logger.info("Redis connected"); });
  client.on("end", () => { isConnected = false; });

  // Connect once at startup — not on every request
  client.connect().catch((err) => {
    logger.error("Redis initial connection failed:", err.message);
    client = null;
  });
}

const getRedisClient = () => (isConnected ? client : null);

module.exports = { getRedisClient };
