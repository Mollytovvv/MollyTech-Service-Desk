const express = require("express");
const router = express.Router();

const {
  authMiddleware
} = require("../middleware/auth.middleware");

const {
  getConversations,
  getConversationById,
  archiveConversation,
  unarchiveConversation,
} = require("../controllers/conversation.controller");

router.get("/", authMiddleware, getConversations);

router.get("/:id", authMiddleware, getConversationById);

router.patch(
  "/:id/archive",
  authMiddleware,
  archiveConversation
);

router.patch(
  "/:id/unarchive",
  authMiddleware,
  unarchiveConversation
);

module.exports = router;