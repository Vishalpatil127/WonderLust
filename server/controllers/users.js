const User = require("../models/user");
const Otp = require("../models/otp");
const ExpressError = require("../utils/ExpressError");
const asyncHandler = require("../middleware/asyncHandler");
const authService = require("../services/authService");
const { sendSuccess } = require("../utils/apiResponse");

module.exports.register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    throw new ExpressError("Username, email, and password are required", 400);
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ExpressError("Username or email already in use", 400);
  }

  const user = new User({
    username,
    email,
    password,
    role: role || "customer",
  });

  await user.save();
  const tokens = await authService.issueTokens(user);

  sendSuccess(res, 201, {
    user: { id: user._id, username: user.username, email: user.email, role: user.role },
    ...tokens,
  });
});

module.exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ExpressError("Email and password are required", 400);
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new ExpressError("Invalid email or password", 401);
  }

  const tokens = await authService.issueTokens(user);

  sendSuccess(res, 200, {
    user: { id: user._id, username: user.username, email: user.email, role: user.role },
    ...tokens,
  });
});

module.exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ExpressError("Refresh token is required", 400);
  }

  const payload = authService.verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.id).select("+refreshToken");

  if (!user || user.refreshToken !== refreshToken) {
    throw new ExpressError("Invalid refresh token", 401);
  }

  const tokens = await authService.issueTokens(user);
  sendSuccess(res, 200, tokens);
});

module.exports.logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.refreshToken = "";
  await user.save();
  sendSuccess(res, 200, { message: "Logged out successfully" });
});

module.exports.getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, {
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ExpressError("Email is required", 400);

  const user = await User.findOne({ email });
  if (!user) throw new ExpressError("User not found", 404);

  const otp = authService.createOtp();
  await Otp.findOneAndUpdate(
    { email },
    { email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    { upsert: true, new: true }
  );

  sendSuccess(res, 200, { message: "OTP sent to your email", otp });
});

module.exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    throw new ExpressError("Email, OTP, and password are required", 400);
  }

  const record = await Otp.findOne({ email, otp });
  if (!record || record.expiresAt < new Date()) {
    throw new ExpressError("Invalid or expired OTP", 400);
  }

  const user = await User.findOne({ email });
  user.password = password;
  await user.save();
  await Otp.deleteOne({ _id: record._id });

  sendSuccess(res, 200, { message: "Password reset successful" });
});

/* ─── Admin: User Management ─────────────────────────────────────────────── */

module.exports.getUsers = asyncHandler(async (req, res) => {
  const page     = Math.max(1, parseInt(req.query.page)  || 1);
  const limit    = Math.min(50, parseInt(req.query.limit) || 20);
  const search   = req.query.search?.trim() || "";
  const roleFilter = req.query.role || "";

  const query = {};
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { email:    { $regex: search, $options: "i" } },
    ];
  }
  if (roleFilter) query.role = roleFilter;

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(query),
  ]);

  sendSuccess(res, 200, {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

module.exports.updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const allowed = ["admin", "host", "customer"];
  if (!allowed.includes(role)) {
    throw new ExpressError(`Invalid role. Must be one of: ${allowed.join(", ")}`, 400);
  }

  // Prevent admin from demoting themselves
  if (String(id) === String(req.user._id)) {
    throw new ExpressError("You cannot change your own role", 400);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!user) throw new ExpressError("User not found", 404);

  sendSuccess(res, 200, { user });
});

module.exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (String(id) === String(req.user._id)) {
    throw new ExpressError("You cannot delete your own account", 400);
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ExpressError("User not found", 404);

  sendSuccess(res, 200, { message: "User deleted successfully" });
});

/* ─── Admin two-step login ────────────────────────────────────────────────── */

/**
 * Step 1 — Verify credentials, then send OTP to admin email.
 * Does NOT issue tokens yet.
 */
module.exports.adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ExpressError("Email and password are required", 400);
  }

  const user = await User.findOne({ email });
  if (!user || user.role !== "admin") {
    throw new ExpressError("Invalid credentials", 401);
  }
  if (!(await user.comparePassword(password))) {
    throw new ExpressError("Invalid credentials", 401);
  }

  // Generate 6-digit OTP valid for 10 minutes
  const otp = authService.createOtp();
  await Otp.findOneAndUpdate(
    { email },
    { email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    { upsert: true, new: true }
  );

  // Send OTP email (fire-and-forget, but log failure)
  const { sendAdminOtpEmail } = require("../services/emailService");
  await sendAdminOtpEmail({ to: email, username: user.username, otp });

  sendSuccess(res, 200, {
    message: "OTP sent to your email. Enter it to complete sign-in.",
    email,   // echo back so frontend can pass it to step 2
  });
});

/**
 * Step 2 — Verify OTP, then issue tokens.
 */
module.exports.verifyAdminOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ExpressError("Email and OTP are required", 400);
  }

  const record = await Otp.findOne({ email, otp });
  if (!record || record.expiresAt < new Date()) {
    throw new ExpressError("Invalid or expired OTP. Please request a new one.", 400);
  }

  const user = await User.findOne({ email });
  if (!user || user.role !== "admin") {
    throw new ExpressError("Unauthorized", 403);
  }

  // Consume the OTP — one-time use
  await Otp.deleteOne({ _id: record._id });

  const tokens = await authService.issueTokens(user);
  sendSuccess(res, 200, {
    user: { id: user._id, username: user.username, email: user.email, role: user.role },
    ...tokens,
  });
});
