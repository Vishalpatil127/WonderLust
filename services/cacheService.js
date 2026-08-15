const { getRedisClient } = require("../config/redis");

const getCachedData = async (key) => {
  const client = getRedisClient();
  if (!client) return null;

  try {
    await client.connect();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

const setCachedData = async (key, value, ttlSeconds = 120) => {
  const client = getRedisClient();
  if (!client) return null;

  try {
    await client.connect();
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return true;
  } catch (error) {
    return null;
  }
};

module.exports = { getCachedData, setCachedData };
