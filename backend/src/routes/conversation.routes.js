const express = require("express");
const router = express.Router();

const Conversation = require("../models/Conversation");
const authMiddleware = require("../middleware/auth.middleware");

// ===============================
// GET ALL CONVERSATIONS
// ===============================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .sort({ updatedAt: -1 })
      .populate("ticketId");

    res.json({
      conversations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;