const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  getSidebarCounts,
  getUserMessageCount
} = require("../controllers/dashboard.controller");


// ===============================
// 📊 SIDEBAR COUNTS
// ===============================

router.get(
  "/sidebar-counts",
  authMiddleware,
  getSidebarCounts
);

router.get(
  "/user-message-count",
  authMiddleware,
  getUserMessageCount
);

module.exports = router;