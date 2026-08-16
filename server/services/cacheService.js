const { getRedisClient } = require("../config/redis");

/**
 * Returns cached value for key, or null if not found / Redis unavailable.
 */
const getCachedData = async (key) => {
  const client = getRedisClient();
  if (!client) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

/**
 * Stores value under key with optional TTL (seconds). No-ops if Redis unavailable.
 */
const setCachedData = async (key, value, ttlSeconds = 120) => {
  const client = getRedisClient();
  if (!client) return false;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return true;
  } catch {
    return false;
  }
};

/**
 * Deletes a key. No-ops if Redis unavailable.
 */
const deleteCachedData = async (key) => {
  const client = getRedisClient();
  if (!client) return false;
  try {
    await client.del(key);
    return true;
  } catch {
    return false;
  }
};

module.exports = { getCachedData, setCachedData, deleteCachedData };
