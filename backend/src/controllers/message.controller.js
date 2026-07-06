const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// ===============================
// 💬 SEND MESSAGE
// ===============================
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    // ===============================
    // VALIDATION
    // ===============================
    if (!conversationId) {
      return res.status(400).json({
        message: "conversationId is required",
      });
    }

    if ((!text || !text.trim()) && !req.file) {
      return res.status(400).json({
        message: "Message or attachment is required",
      });
    }

    // ===============================
    // FIND CONVERSATION
    // ===============================
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    // ===============================
    // AUTHORIZATION CHECK
    // ===============================
    const isParticipant = conversation.participants?.some(
      (p) => p.userId?.toString() === req.user.id?.toString()
    );

    if (!isParticipant && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You are not allowed to send messages in this conversation",
      });
    }

    // ===============================
    // ATTACHMENT
    // ===============================
    let attachment = null;

    if (req.file) {
      attachment = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/messages/${req.file.filename}`,
      };
    }

    // ===============================
    // CREATE MESSAGE
    // ===============================
    const message = await Message.create({
      conversationId,
      sender: req.user.id,
      senderRole: req.user.role || "user",
      text: text?.trim() || "",
      attachment,
    });

    // ===============================
    // POPULATE SENDER
    // ===============================
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "_id firstName lastName role");

    // ===============================
    // UPDATE CONVERSATION
    // ===============================
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text?.trim()
        ? text.trim()
        : req.file
        ? "📎 Attachment"
        : "",
      updatedAt: new Date(),
    });

    // ===============================
    // SOCKET.IO
    // ===============================
    const io = req.app.get("io");

    if (io) {
      io.to(conversationId).emit(
        "receiveMessage",
        populatedMessage
      );
    }

    // ===============================
    // RESPONSE
    // ===============================
    return res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
    });

  } catch (err) {
    console.log("SEND MESSAGE ERROR:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// ===============================
// 📥 GET MESSAGES
// ===============================
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({
        message: "conversationId is required",
      });
    }

    // ===============================
    // GET CONVERSATION
    // ===============================
    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: "ticketId",
        select:
          "_id title description status priority category assignedTo createdAt comments email phoneNumber",
      })
      .populate({
        path: "participants.userId",
        select: "firstName lastName email phoneNumber",
      });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    // ===============================
    // REQUESTER INFO
    // ===============================
    const requesterParticipant = conversation.participants.find(
      (p) => p.role === "user"
    );

    const requester = requesterParticipant?.userId
      ? {
          _id: requesterParticipant.userId._id,
          firstName: requesterParticipant.userId.firstName,
          lastName: requesterParticipant.userId.lastName,
          email: requesterParticipant.userId.email,
          phoneNumber: requesterParticipant.userId.phoneNumber,
        }
      : null;

    // ===============================
    // GET MESSAGES
    // ===============================
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("sender", "_id firstName lastName role");

    // ===============================
    // RESPONSE
    // ===============================
    return res.json({
      count: messages.length,
      ticket: conversation.ticketId,
      requester,
      messages,
    });

  } catch (err) {
    console.log("GET MESSAGES ERROR:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};