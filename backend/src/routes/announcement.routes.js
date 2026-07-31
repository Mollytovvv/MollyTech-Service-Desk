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
  authMiddleware
} = require("../middleware/auth.middleware");

// ===============================
// GET ALL ANNOUNCEMENTS
// ===============================
router.get(
  "/",
  authMiddleware,
  getAnnouncements
);

// ===============================
// GET SINGLE ANNOUNCEMENT
// ===============================
router.get(
  "/:id",
  authMiddleware,
  getAnnouncementById
);

// ===============================
// CREATE ANNOUNCEMENT
// ===============================
router.post(
  "/",
  authMiddleware,
  createAnnouncement
);

// ===============================
// UPDATE ANNOUNCEMENT
// ===============================
router.patch(
  "/:id",
  authMiddleware,
  updateAnnouncement
);

// ===============================
// DELETE ANNOUNCEMENT
// ===============================
router.delete(
  "/:id",
  authMiddleware,
  deleteAnnouncement
);

// ===============================
// PIN / UNPIN ANNOUNCEMENT
// ===============================
router.patch(
  "/:id/pin",
  authMiddleware,
  togglePinned
);

// ===============================
// SHOW / HIDE ANNOUNCEMENT
// ===============================
router.patch(
  "/:id/active",
  authMiddleware,
  toggleActive
);

module.exports = router;