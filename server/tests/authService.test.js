const jwt = require("jsonwebtoken");
const { generateAccessToken, createOtp, verifyRefreshToken } = require("../services/authService");
const env = require("../config/env");

describe("authService", () => {
  test("generateAccessToken signs a valid JWT token", () => {
    const payload = { _id: "64f1c2d7a9e8b1f0c1234567", role: "customer" };
    const token = generateAccessToken(payload);
    const verified = jwt.verify(token, env.JWT_SECRET);

    expect(verified.id).toBe(payload._id);
    expect(verified.role).toBe("customer");
  });

  test("createOtp returns a six digit numeric string", () => {
    const otp = createOtp();

    expect(otp).toMatch(/^\d{6}$/);
  });

  test("verifyRefreshToken validates a refresh token", () => {
    const payload = { id: "64f1c2d7a9e8b1f0c1234567", role: "host" };
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET || env.JWT_SECRET, { expiresIn: "7d" });
    const verified = verifyRefreshToken(refreshToken);

    expect(verified.id).toBe(payload.id);
    expect(verified.role).toBe("host");
  });
});


