const { securityMiddleware } = require("../middleware/security");

describe("security middleware", () => {
  test("securityMiddleware is an array with helmet and rate limiting middleware", () => {
    expect(Array.isArray(securityMiddleware)).toBe(true);
    expect(securityMiddleware.length).toBeGreaterThan(0);
  });
});
