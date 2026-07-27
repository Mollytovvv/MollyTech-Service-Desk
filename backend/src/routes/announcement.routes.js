const express = require("express");

const router = express.Router();

const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  togglePinned,
  toggleActive,
} = require("../controllers/announcement.controller");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// ===============================
// GET ALL ANNOUNCEMENTS
// ===============================
router.get(
  "/",
  protect,
  getAnnouncements
);

// ===============================
// GET SINGLE ANNOUNCEMENT
// ===============================
router.get(
  "/:id",
  protect,
  getAnnouncementById
);

// ===============================
// CREATE ANNOUNCEMENT
// ===============================
router.post(
  "/",
  protect,
  adminOnly,
  createAnnouncement
);

// ===============================
// UPDATE ANNOUNCEMENT
// ===============================
router.patch(
  "/:id",
  protect,
  adminOnly,
  updateAnnouncement
);

// ===============================
// DELETE ANNOUNCEMENT
// ===============================
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteAnnouncement
);

// ===============================
// PIN / UNPIN ANNOUNCEMENT
// ===============================
router.patch(
  "/:id/pin",
  protect,
  adminOnly,
  togglePinned
);

// ===============================
// SHOW / HIDE ANNOUNCEMENT
// ===============================
router.patch(
  "/:id/active",
  protect,
  adminOnly,
  toggleActive
);

module.exports = router;