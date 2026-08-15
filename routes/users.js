const express = require("express");
const router = express.Router();
const users = require("../controllers/users");
const { authenticate } = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.post("/register", users.register);
router.post("/login", users.login);
router.post("/admin/login", users.adminLogin);
router.post("/admin/verify-otp", users.verifyAdminOtp);
router.post("/refresh", users.refreshToken);
router.post("/logout", authenticate, users.logout);
router.get("/me", authenticate, users.getMe);
router.post("/forgot-password", users.forgotPassword);
router.post("/reset-password", users.resetPassword);

// Admin — user management
router.get("/admin/users",           authenticate, authorize("admin"), users.getUsers);
router.patch("/admin/users/:id/role",authenticate, authorize("admin"), users.updateUserRole);
router.delete("/admin/users/:id",    authenticate, authorize("admin"), users.deleteUser);

module.exports = router;
