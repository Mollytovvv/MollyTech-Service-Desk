// ===============================
// 📌 TICKET CONTROLLER - SERVICE DESK SYSTEM
// ===============================

const Ticket = require("../models/Ticket");
const Conversation = require("../models/Conversation");
const formatPHNumber = require("../utils/formatPHNumber");
const Message = require("../models/Message");

// ===============================
// 🧾 CREATE TICKET + CONVERSATION
// ===============================
const createTicket = async (req, res) => {
  try {
console.log("BODY:", req.body);

const rawPhone =
  req.body.phoneNumber || req.body.phone;

console.log("PHONE:", req.body.phone);
console.log("PHONE NUMBER:", req.body.phoneNumber);
console.log("RAW PHONE:", rawPhone);

const phoneNumber = rawPhone
  ? formatPHNumber(rawPhone)
  : null;

console.log("FORMATTED PHONE:", phoneNumber);

    // =========================
    // 1. CREATE TICKET
    // =========================
    const ticket = await Ticket.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      email: req.body.email,
      phoneNumber,

      submittedBy: req.user
        ? {
            firstName: req.user?.firstName || "Unknown",
            lastName: req.user?.lastName || "User",
          }
        : {
            firstName: "System",
            lastName: "User",
          },

      activityLogs: [
        {
          action: "Ticket Created",
          performedBy: req.user?.id || "system",
          details: "Ticket was created",
        },
      ],
    });

    // =========================
    // 2. CREATE CONVERSATION
    // =========================
    const conversation = await Conversation.create({
      ticketId: ticket._id,
      participants: req.user
        ? [
            {
              userId: req.user._id || req.user.id,
              role: req.user.role || "user",
              unreadCount: 0,
              lastReadAt: new Date(),
              isArchived: false,
            },
          ]
        : [
            {
              userId: null,
              role: "system",
            },
          ],
      lastMessage: "",
    });

    console.log("🔥 CREATED CONVERSATION:", conversation._id);

    // =========================
    // REAL-TIME TICKET EVENT
    // =========================
    const io = req.app.get("io");

    io.emit("newTicket", ticket);

    // =========================
    // 3. RESPONSE
    // =========================
    return res.status(201).json({
      message: "Ticket created successfully",
      ticket,
      conversationId: conversation._id, // useful for frontend
    });

  } catch (err) {
    console.log("CREATE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createTicket,
};

  // ===============================
  // 📄 GET ALL TICKETS
  // ===============================
  const getTickets = async (req, res) => {
    try {
  const tickets = await Ticket.find({
    status: { $ne: "archived" }
  })
  .sort({ createdAt: -1 });

  console.log(JSON.stringify(tickets, null, 2));

  res.json({
    count: tickets.length,
    tickets,
  });

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

// ===============================
// 📄 GET ONE TICKET
// ===============================
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

  // ===============================
  // ✏️ UPDATE TICKET
  // ===============================
  const updateTicket = async (req, res) => {
  console.log("STATUS UPDATE HIT:", req.body.status);
    try {
  const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // =========================
      // STATUS UPDATE (SAFE)
      // =========================
      if (req.body.status) {
        const previous = ticket.status;
        const next = req.body.status;

        const allowedStatuses = [
          "open",
          "in_progress",
          "resolved",
          "closed",
          "archived"
        ];

        if (!allowedStatuses.includes(next)) {
          return res.status(400).json({ message: "Invalid status value" });
        }

        if (previous !== next) {
          ticket.status = next;

          ticket.activityLogs.push({
            action: "Status Updated",
            performedBy: req.user._id || req.user.id,
            details: `${previous} → ${next}`
          });

          if (next === "archived") {
            ticket.archivedAt = new Date();
          }
        }
      }

      // =========================
      // OTHER FIELDS
      // =========================
      if (req.body.title) ticket.title = req.body.title;
      if (req.body.description) ticket.description = req.body.description;
      if (req.body.priority) ticket.priority = req.body.priority;

      ticket.updatedAt = new Date();

      const updatedTicket = await ticket.save();

      return res.json({
        message: "Ticket updated successfully",
        ticket: updatedTicket
      });

    } catch (err) {
      console.log("UPDATE ERROR:", err);
      return res.status(500).json({
        message: err.message
      });
    }
  };

// ===============================
// 👨‍💼 ASSIGN TICKET
// ===============================
const assignTicket = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          assignedTo: assignedTo || null,
        },
        $push: {
          activityLogs: {
            action: "Ticket Assigned",
            performedBy: req.user?.id || "system",
            details: assignedTo || "Unassigned",
          },
        },
      },
      {
        new: true,
        runValidators: false, // 🔥 THIS IS THE KEY FIX
      }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.json({
      message: "Ticket assigned successfully",
      ticket: updatedTicket,
    });

  } catch (err) {
    console.log("ASSIGN ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ===============================
// 🔄 REOPEN / UNRESOLVE TICKET
// ===============================
const reopenTicket = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can reopen tickets",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    if (ticket.status !== "resolved") {
      return res.status(400).json({
        message: "Only resolved tickets can be reopened",
      });
    }

    ticket.status = "open";

    ticket.activityLogs.push({
      action: "Ticket Reopened",
      performedBy: req.user.id,
      details: "Resolved ticket reopened",
    });

    await ticket.save();

    return res.json({
      message: "Ticket reopened successfully",
      ticket,
    });

  } catch (err) {
    console.log("REOPEN ERROR:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// ===============================
// 🗑 DELETE TICKET
// ===============================
const deleteTicket = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can delete tickets"
      });
    }

    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({ message: "Ticket deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// 📊 STATS
// ===============================
const getTicketStats = async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: "open" });
    const in_progress = await Ticket.countDocuments({ status: "in_progress" });
    const resolved = await Ticket.countDocuments({ status: "resolved" });
    const closed = await Ticket.countDocuments({ status: "closed" });
    const archived = await Ticket.countDocuments({ status: "archived" });

    res.json({
      total,
      open,
      in_progress,
      resolved,
      closed,
      archived
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// 🔎 FILTER BY STATUS
// ===============================
const getTicketsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const allowed = ["open", "in_progress", "resolved", "closed", "archived"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const tickets = await Ticket.find({ status }).sort({ createdAt: -1 });

    res.json({
      status,
      count: tickets.length,
      tickets
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// 👨‍💻 MY ASSIGNED TICKETS
// ===============================
  const getMyAssignedTickets = async (req, res) => {
    try {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

    const tickets = await Ticket.find({
      assignedTo: userId
    }).sort({ createdAt: -1 });

    res.json({
      count: tickets.length,
      tickets
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// 💬 ADD COMMENT
// ===============================
const addTicketComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // ❌ BLOCK USERS
    if (req.user?.role === "user") {
      return res.status(403).json({
        message: "Users are not allowed to comment on tickets"
      });
    }

    // ❌ VALIDATION
    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty"
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const username = req.user
      ? `${req.user.firstName} ${req.user.lastName}`
      : "System";

    // 💬 ADD COMMENT
    ticket.comments.push({
      user: username,
      message,
    });

    // ===============================
    // 💬 MIRROR FIRST SUPPORT NOTE TO CHAT
    // ===============================
    const conversation = await Conversation.findOne({
      ticketId: ticket._id,
    });

    if (conversation) {
      const existingMessages = await Message.countDocuments({
        conversationId: conversation._id,
      });

      // Only mirror if this is the FIRST message
      if (existingMessages === 0) {
        const chatMessage = await Message.create({
          conversationId: conversation._id,
          sender: req.user.id,
          senderRole: req.user.role || "admin",
          text: message,
        });

        conversation.lastMessage = message;
        conversation.updatedAt = new Date();
        await conversation.save();

        // Real-time update
        const io = req.app.get("io");

        if (io) {
          io.to(conversation._id.toString()).emit(
            "receiveMessage",
            chatMessage
          );
        }
      }
    }

    // 📜 LOG ACTIVITY
    ticket.activityLogs.push({
      action: "Comment Added",
      performedBy: username,
      details: message,
    });

    await ticket.save();

    return res.json({
      message: "Comment added successfully",
      ticket,
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ===============================
// 📦 BULK ARCHIVE RESOLVED TICKETS
// ===============================
const archiveTickets = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can archive tickets"
      });
    }

    const { ticketIds } = req.body;

    if (!ticketIds || !Array.isArray(ticketIds)) {
      return res.status(400).json({
        message: "ticketIds array is required"
      });
    }

    // find tickets
    const tickets = await Ticket.find({
      _id: { $in: ticketIds }
    });

    // ensure all are resolved
    const invalid = tickets.filter(t => t.status !== "resolved");

    if (invalid.length > 0) {
      return res.status(400).json({
        message: "Only resolved tickets can be archived",
        invalidIds: invalid.map(t => t._id)
      });
    }

    // update all
    await Ticket.updateMany(
      { _id: { $in: ticketIds } },
      {
        $set: {
          status: "archived",
          archivedAt: Date.now()
        }
      }
    );

    res.json({
      message: "Tickets archived successfully",
      archivedCount: ticketIds.length
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

  const unarchiveTickets = async (req, res) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Only admin can unarchive tickets" });
      }

      const { ticketIds } = req.body;

      if (!ticketIds || !Array.isArray(ticketIds)) {
        return res.status(400).json({ message: "ticketIds array required" });
      }

      await Ticket.updateMany(
        { _id: { $in: ticketIds } },
        {
          $set: {
            status: "resolved",   // ✅ IMPORTANT FIX (NOT "open")
            archivedAt: null
          }
        }
      );

      return res.json({
        message: "Tickets restored successfully",
        restoredCount: ticketIds.length
      });

    } catch (err) {
      console.log("UNARCHIVE ERROR:", err);
      return res.status(500).json({ message: err.message });
    }
  };

// ===============================
// 📦 EXPORTS
// ===============================
module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  assignTicket,
  reopenTicket,
  deleteTicket,
  getTicketStats,
  getTicketsByStatus,
  getMyAssignedTickets,
  addTicketComment,
  archiveTickets,
  unarchiveTickets
};