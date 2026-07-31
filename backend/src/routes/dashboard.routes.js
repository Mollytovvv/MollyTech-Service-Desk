const express = require("express");
const router = express.Router();

const {
  authMiddleware,
} = require("../middleware/auth.middleware");

const roleMiddleware = require("../middleware/role.middleware");


const {
  getSidebarCounts,
  getUserMessageCount,
  getStaffRecentUsers
} = require("../controllers/dashboard.controller");


// ===============================
// 📊 ADMIN / STAFF SIDEBAR COUNTS
// ===============================

router.get(
  "/sidebar-counts",
  authMiddleware,
  roleMiddleware(
    "admin",
    "technician",
    "support"
  ),
  getSidebarCounts
);


// ===============================
// 💬 USER MESSAGE COUNT
// ===============================
// Used by UserDashboardLayout
// Shows unread replies from IT Support

router.get(
  "/user-message-count",
  authMiddleware,
  roleMiddleware(
    "user"
  ),
  getUserMessageCount
);


// ===============================
// 👥 STAFF RECENT USERS
// ===============================
// Staff only

router.get(
  "/staff-recent-users",
  authMiddleware,
  roleMiddleware(
    "technician",
    "support"
  ),
  getStaffRecentUsers
);


module.exports = router;