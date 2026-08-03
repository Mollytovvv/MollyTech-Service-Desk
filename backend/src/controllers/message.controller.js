const path = require("path");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ===============================
// 💬 SEND MESSAGE
// ===============================
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

const conversation = await Conversation.findById(conversationId)
  .populate("ticketId");

if (!conversation) {
  return res.status(404).json({
    message:"Conversation not found"
  });
}


// 🔒 BLOCK CLOSED CONVERSATIONS

if (conversation.status === "closed") {
  return res.status(403).json({
    message:"This conversation is closed."
  });
}


// 🔒 BLOCK DELETED TICKETS

if (
  conversation.ticketId?.deletedByUser === true
) {
  return res.status(403).json({
    message:"This ticket has been deleted."
  });
}

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
    // AUTHORIZATION CHECK
    // ===============================
    const isParticipant = conversation.participants?.some(
      (p) =>
        p.userId?.toString() === req.user.id?.toString()
    );


    const isStaff = [
      "admin",
      "support",
      "technician",
      "it_support",
    ].includes(req.user.role);


    const assignedStaff =
    (
      conversation.ticketId?.assignedTo?._id ||
      conversation.ticketId?.assignedTo
    )?.toString()
    ===
    req.user.id.toString();


    if (
      !isParticipant &&
      !isStaff &&
      !assignedStaff
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to send messages in this conversation",
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
    conversation.lastMessage = text?.trim()
      ? text.trim()
      : req.file
      ? "📎 Attachment"
      : "";

    conversation.updatedAt = new Date();

    // ===============================
    // UPDATE UNREAD USERS
    // ===============================

    conversation.unreadBy = [];

    // USER -> notify assigned staff/admin
    if (req.user.role === "user") {

      conversation.unreadBy = [];

      // Assigned technician/support
      if (conversation.ticketId?.assignedTo) {
        conversation.unreadBy.push(
          conversation.ticketId.assignedTo._id ||
          conversation.ticketId.assignedTo
        );
      }

      // Admins
      const admins = await User.find({
        role: "admin",
      }).select("_id");

      admins.forEach((admin) => {
        conversation.unreadBy.push(admin._id);
      });

    }

    // STAFF -> notify requester
    else {

      const requester =
        conversation.participants.find(
          p => p.role === "user"
        );

      if (requester) {
        conversation.unreadBy.push(
          requester.userId.toString()
        );
      }

    }

    await conversation.save();

    const verifyConversation =
      await Conversation.findById(conversation._id);

    console.log("================================");
    console.log("AFTER SAVE");
    console.log("UnreadBy:", verifyConversation.unreadBy);
    console.log("================================");

    console.log("Conversation saved.");

    console.log(
      "Participants:",
      conversation.participants
    );

    // ===============================
    // 🔔 CREATE MESSAGE NOTIFICATIONS
    // ===============================

    const io = req.app.get("io");

    // USER -> Notify all support staff
    if (req.user.role === "user") {

    const staff = await User.find({
      role: {
        $in: [
          "admin",
          "support",
          "technician",
          "it_support",
        ],
      },
    });

      for (const member of staff) {

        const notification =
          await Notification.create({

            recipient: member._id,

            sender: req.user.id,

            type: "new_message",

            title: "New User Message",

            message: `${req.user.firstName} ${req.user.lastName} sent a new message regarding Ticket ${conversation.ticketId.ticketId}.`,

            ticketId: conversation.ticketId,

            conversationId: conversation._id,

          });

        const populatedNotification =
          await Notification.findById(notification._id)
            .populate(
              "sender",
              "_id firstName lastName role"
            )
            .populate(
              "ticketId",
              "ticketId title status"
            );

        io.to(member._id.toString()).emit(
          "notificationCreated",
          populatedNotification
        );

      }

    }

    // ADMIN / TECHNICIAN -> Notify ticket owner
    else {

      const requester =
        conversation.participants.find(
          (participant) =>
            participant.role === "user"
        );

      if (requester) {

        const notification =
          await Notification.create({

            recipient: requester.userId,

            sender: req.user.id,

            type: "new_message",

            title: "New Reply",

            message: "A support team member replied to your ticket.",

            ticketId: conversation.ticketId,

            conversationId: conversation._id,

          });

        const populatedNotification =
          await Notification.findById(notification._id)
            .populate(
              "sender",
              "_id firstName lastName role"
            )
            .populate(
              "ticketId",
              "ticketId title status"
            );

        io.to(requester.userId.toString()).emit(
          "notificationCreated",
          populatedNotification
        );

      }

    }

    // ===============================
    // SOCKET.IO
    // ===============================
    if (io) {

      io.to(conversationId).emit(
        "receiveMessage",
        populatedMessage
      );


      io.emit("conversationUpdated", {
        conversationId: conversation._id,
        lastMessage: conversation.lastMessage,
        updatedAt: conversation.updatedAt,
        unreadBy: conversation.unreadBy,
      });

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

    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: "ticketId",
        select:
          "_id ticketId title description status priority category assignedTo createdAt comments email phoneNumber",
        populate: {
          path: "assignedTo",
          select: "firstName lastName role",
        },
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
    // REMOVE CURRENT USER FROM UNREAD
    // ===============================

    conversation.unreadBy =
      (conversation.unreadBy || []).filter(
        (id) => id.toString() !== req.user.id.toString()
      );

    await conversation.save();

    // ===============================
    // UPDATE SIDEBAR IN REALTIME
    // ===============================
    const io = req.app.get("io");

    if (io) {
      io.emit("conversationUpdated", {
        conversationId: conversation._id,
        lastMessage: conversation.lastMessage,
        updatedAt: conversation.updatedAt,
        unreadBy: conversation.unreadBy,
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
      conversation,
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

  // ===============================
  // 📥 DOWNLOAD ATTACHMENT
  // ===============================
  const downloadAttachment = async (req, res) => {
    try {
      const { filename } = req.params;

      const message = await Message.findOne({
        "attachment.filename": filename,
      });

      if (!message || !message.attachment) {
        return res.status(404).json({
          message: "Attachment not found",
        });
      }

      const filePath = path.join(
        __dirname,
        "../../uploads/messages",
        message.attachment.filename
      );

      return res.download(
        filePath,
        message.attachment.originalname
      );

    } catch (err) {
      console.log("DOWNLOAD ERROR:", err);

      return res.status(500).json({
        message: err.message,
      });
    }
  };

module.exports = {
  sendMessage,
  getMessages,
  downloadAttachment,
};