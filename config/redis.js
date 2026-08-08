const redis = require("redis");
const env = require("./env");

let client;

if (env.REDIS_URL) {
  client = redis.createClient({ url: env.REDIS_URL });
  client.on("error", (err) => console.error("Redis Client Error", err));
}

const getRedisClient = () => client;

module.exports = { getRedisClient };
