const jwt = require("jsonwebtoken");
const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");
const asyncHandler = require("./asyncHandler");
const env = require("../config/env");
const { generateAccessToken } = require("../services/authService");

const JWT_SECRET = env.JWT_SECRET;

const generateToken = (user) => generateAccessToken(user);

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ExpressError("Authentication required", 401);
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new ExpressError("User not found", 401);
  }

  req.user = user;
  next();
});

module.exports = { generateToken, authenticate, JWT_SECRET };
