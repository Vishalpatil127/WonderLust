const express = require("express");
const router = express.Router();
const dashboard = require("../controllers/dashboard");
const { authenticate } = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.get("/admin", authenticate, authorize("admin"), dashboard.getAdminDashboard);
router.get("/host", authenticate, authorize("host", "admin"), dashboard.getHostDashboard);

module.exports = router;