const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");
const env = require("../config/env");

const generateAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, env.JWT_REFRESH_SECRET || env.JWT_SECRET, {
    expiresIn: "7d",
  });

const issueTokens = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET || env.JWT_SECRET);
  } catch (error) {
    throw new ExpressError("Invalid refresh token", 401);
  }
};

const createOtp = () => crypto.randomInt(100000, 999999).toString();

const authService = {
  generateAccessToken,
  generateRefreshToken,
  issueTokens,
  verifyRefreshToken,
  createOtp,
};

module.exports = authService;
