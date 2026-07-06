const router = require("express").Router();

const {
  sendMessage,
  getMessages,
} = require("../controllers/message.controller");

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// ===============================
// SEND MESSAGE
// ===============================
router.post(
  "/",
  authMiddleware,
  upload.single("attachment"),
  sendMessage
);

// ===============================
// GET MESSAGES
// ===============================
router.get("/:conversationId", authMiddleware, getMessages);

module.exports = router;