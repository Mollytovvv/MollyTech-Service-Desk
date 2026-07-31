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
// 📊 SIDEBAR COUNTS
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
// 💬 MESSAGE COUNT
// ===============================

router.get(
  "/user-message-count",
  authMiddleware,
  roleMiddleware(
    "admin",
    "technician",
    "support"
  ),
  getUserMessageCount
);


// ===============================
// 👥 STAFF RECENT USERS
// ===============================
// Staff only see users connected
// to their assigned tickets

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