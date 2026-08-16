const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For if behind proxy, otherwise use remoteAddress
    return req.ip || req.connection.remoteAddress;
  },
  skip: (req) => {
    // Skip rate limiting for health checks and favicons
    return req.path === '/' || req.path === '/favicon.ico';
  },
});

const sanitizeObject = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item));
  }

  if (value && typeof value === "object") {
    const sanitized = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (key.startsWith("$") || key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }

      sanitized[key] = sanitizeObject(nestedValue);
    }

    return sanitized;
  }

  return value;
};

const sanitizeRequestData = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

const securityMiddleware = [
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
  sanitizeRequestData,
  limiter,
];

module.exports = { securityMiddleware, limiter };
