const express = require("express");

const router = express.Router();

const {
  authMiddleware: verifyToken
} = require("../middleware/auth.middleware");

const {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

// ===============================
// 📥 GET ALL NOTIFICATIONS
// ===============================
router.get(
  "/",
  verifyToken,
  getNotifications
);

// ===============================
// 🔔 CREATE NOTIFICATION
// ===============================
router.post(
  "/",
  verifyToken,
  createNotification
);

// ===============================
// ✅ MARK ALL AS READ
// ===============================
router.patch(
  "/read-all",
  verifyToken,
  markAllAsRead
);

// ===============================
// ✅ MARK SINGLE AS READ
// ===============================
router.patch(
  "/:id/read",
  verifyToken,
  markAsRead
);

// ===============================
// 🗑 DELETE NOTIFICATION
// ===============================
router.delete(
  "/:id",
  verifyToken,
  deleteNotification
);

module.exports = router;