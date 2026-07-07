const router = require("express").Router();

const {
  sendMessage,
  getMessages,
  downloadAttachment,
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
// DOWNLOAD ATTACHMENT
// ===============================
router.get(
  "/download/:filename",
  authMiddleware,
  downloadAttachment
);

// ===============================
// GET MESSAGES
// ===============================
router.get(
  "/:conversationId",
  authMiddleware,
  getMessages
);

module.exports = router;