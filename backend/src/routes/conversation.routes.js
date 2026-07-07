const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  getConversations,
  getConversationById,
} = require("../controllers/conversation.controller");

router.get("/", authMiddleware, getConversations);

router.get("/:id", authMiddleware, getConversationById);

module.exports = router;