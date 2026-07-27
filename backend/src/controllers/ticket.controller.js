// ===============================
// 📌 TICKET CONTROLLER - SERVICE DESK SYSTEM
// ===============================

const User = require("../models/User");
const Ticket = require("../models/Ticket");
const Conversation = require("../models/Conversation");
const formatPHNumber = require("../utils/formatPHNumber");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

// ===============================
// 🧾 CREATE TICKET + CONVERSATION
// ===============================
const createTicket = async (req, res) => {
  try {

const user = await User.findById(
    req.user.id
);


if(!user){

    return res.status(404).json({
        message:"User not found"
    });

}

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
    // GENERATE TICKET ID
    // =========================
    const lastTicket = await Ticket.findOne()
      .sort({ createdAt: -1 })
      .select("ticketId");

    let ticketId = "MT-000001";

    if (lastTicket?.ticketId) {
      const lastNumber = parseInt(
        lastTicket.ticketId.replace("MT-", ""),
        10
      );

      ticketId = `MT-${String(lastNumber + 1).padStart(6, "0")}`;
    }

    const currentUser = await User.findById(req.user.id);

    if(!user){

        return res.status(404).json({
            message:"User not found"
        });

    }

  // =========================
  // 1. CREATE TICKET
  // =========================
  const ticket = await Ticket.create({

      ticketId,

      title: req.body.title,

      description: req.body.description,

      category: req.body.category,

      priority: req.body.priority,


      // Snapshot current contact information
      email: currentUser.email,

      phoneNumber: currentUser.phone,


      // Snapshot user identity
      submittedBy: {

          userId: currentUser._id,

          firstName: currentUser.firstName,

          lastName: currentUser.lastName,

      },


      activityLogs: [

          {
              action: "Ticket Created",

              performedBy: currentUser._id,

              details: "Ticket was created",

          },

      ],

  });

    // ===============================
    // 🔥 REALTIME NEW TICKET EVENT
    // ===============================
    const io = req.app.get("io");

    if (io) {

        io.emit(
            "newTicket",
            ticket
        );

    }

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
    // CREATE ADMIN NOTIFICATIONS
    // =========================
    const admins = await User.find({
      role: "admin",
    });

    // Notify every admin
    for (const admin of admins) {

    const notification = await Notification.create({
      recipient: admin._id,
      sender: req.user.id,
      type: "new_ticket",
      title: "New Ticket Submitted",
      message: `${req.user.firstName} submitted "${ticket.title}"`,
      ticketId: ticket._id,
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
          )
          .populate(
            "conversationId",
            "_id"
          );

      io.to(admin._id.toString()).emit(
        "notificationCreated",
        populatedNotification
      );

    }

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

  // ===============================
  // 📄 GET ALL TICKETS
  // ===============================
  const getTickets = async (req, res) => {
    try {
  const query = Ticket.find({
      "archivedBy.admin": false,
      status: { $ne: "cancelled" }
  });

  const tickets = await query.sort({ createdAt: -1 });

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
    try {

      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({
          message: "Ticket not found",
        });
      }

      // ==========================
      // USER MUST OWN THE TICKET
      // ==========================

      if (
        req.user.role === "user" &&
        ticket.submittedBy.userId.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message: "You are not allowed to edit this ticket",
        });
      }

      // ==========================
      // ONLY PENDING TICKETS
      // ==========================

      if (
        req.user.role === "user" &&
        ticket.status !== "pending"
      ) {
        return res.status(400).json({
          message: "Only pending tickets can be edited.",
        });
      }

      // ==========================
      // UPDATE FIELDS
      // ==========================

      ticket.title = req.body.title ?? ticket.title;
      ticket.description = req.body.description ?? ticket.description;
      ticket.category = req.body.category ?? ticket.category;
      ticket.priority = req.body.priority ?? ticket.priority;
      ticket.email = req.body.email ?? ticket.email;

      if (req.body.phoneNumber) {
        ticket.phoneNumber = formatPHNumber(req.body.phoneNumber);
      }

      ticket.activityLogs.push({
        action: "Ticket Updated",
        performedBy: req.user.id,
        details: "User edited the ticket information",
      });

      const updatedTicket = await ticket.save();

      const io = req.app.get("io");

      io.emit("ticketUpdated", updatedTicket);

      return res.json({
        message: "Ticket updated successfully",
        ticket: updatedTicket,
      });

    } catch (err) {

      console.log("UPDATE ERROR:", err);

      return res.status(500).json({
        message: err.message,
      });

    }
  };

  // ===============================
  // ❌ CANCEL TICKET (USER)
  // ===============================
  const cancelTicket = async (req, res) => {
    try {

      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({
          message: "Ticket not found",
        });
      }

      // Owner only
      if (
        ticket.submittedBy.userId.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message: "Unauthorized",
        });
      }

      // Only pending tickets
      if (ticket.status !== "pending") {
        return res.status(400).json({
          message: "Only pending tickets can be cancelled.",
        });
      }

      ticket.status = "cancelled";

      ticket.activityLogs.push({
        action: "Ticket Cancelled",
        performedBy: req.user.id,
        details: "User cancelled the ticket.",
      });

      await ticket.save();

      const io = req.app.get("io");

      io.emit("ticketUpdated", ticket);

      return res.json({
        message: "Ticket cancelled successfully.",
        ticket,
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message: err.message,
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
        runValidators: false, 
      }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // ===============================
    // CREATE USER NOTIFICATION
    // ===============================

    const notification =
      await Notification.create({
        recipient:
          updatedTicket.submittedBy.userId,
        sender: req.user.id,
        type: "ticket_assigned",
        title: "Ticket Assigned",
        message: `Your ticket "${updatedTicket.title}" has been assigned.`,
        ticketId: updatedTicket._id,
      });

    // ===============================
    // POPULATE NOTIFICATION
    // ===============================

    const populatedNotification =
      await Notification.findById(
        notification._id
      )
        .populate(
          "sender",
          "_id firstName lastName role"
        )
        .populate(
          "ticketId",
          "ticketId title status"
        );

    // ===============================
    // REAL-TIME EVENTS
    // ===============================

    const io = req.app.get("io");

    // Update tickets
    io.emit("ticketUpdated", updatedTicket);

    // Send notification
    io.to(
      updatedTicket.submittedBy.userId.toString()
    ).emit(
      "notificationCreated",
      populatedNotification
    );

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
// ✅ RESOLVE TICKET
// ===============================
const resolveTicket = async (req, res) => {
  try {

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    if (ticket.status === "resolved") {
      return res.status(400).json({
        message: "Ticket is already resolved",
      });
    }

    ticket.status = "resolved";

    ticket.activityLogs.push({
      action: "Ticket Resolved",
      performedBy: req.user?.id || "system",
      details: "Ticket marked as resolved",
    });

    const updatedTicket = await ticket.save();

    const io = req.app.get("io");

// ===============================
// 🔔 NOTIFY USER TICKET RESOLVED
// ===============================

const notification = await Notification.create({

  recipient: ticket.submittedBy.userId,

  sender: req.user.id,

  type: "ticket_resolved",

  title: "Ticket Resolved",

  message: `Your ticket "${ticket.title}" has been resolved.`,

  ticketId: ticket._id,

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


if(io){

  io.to(ticket.submittedBy.userId.toString())
    .emit(
      "notificationCreated",
      populatedNotification
    );

}

    io.emit("ticketUpdated", updatedTicket);


    return res.json({
      message: "Ticket resolved successfully",
      ticket: updatedTicket,
    });


  } catch (err) {

    console.log("RESOLVE ERROR:", err);

    return res.status(500).json({
      message: err.message,
    });

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

    ticket.status = "pending";

    ticket.activityLogs.push({
      action: "Ticket Reopened",
      performedBy: req.user.id,
      details: "Resolved ticket reopened",
    });

    await ticket.save();

    const io = req.app.get("io");

    io.emit("ticketUpdated", ticket);

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

    const io = req.app.get("io");

    io.emit("ticketUpdated");

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
    const pending = await Ticket.countDocuments({ status: "pending" });
    const in_progress = await Ticket.countDocuments({ status: "in_progress" });
    const resolved = await Ticket.countDocuments({ status: "resolved" });
    const closed = await Ticket.countDocuments({ status: "closed" });
    const archived = await Ticket.countDocuments({ status: "archived" });

    res.json({
      total,
      pending,
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

    const allowed = ["pending", "in_progress", "resolved", "closed", "archived"];

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
// 📦 GET ADMIN ARCHIVED TICKETS
// ===============================
const getArchivedTickets = async (req, res) => {
  try {

    const tickets = await Ticket.find({
      "archivedBy.admin": true,
    }).sort({ updatedAt: -1 });

    return res.json({
      count: tickets.length,
      tickets,
    });

  } catch (err) {

    return res.status(500).json({
      message: err.message,
    });

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

    console.log("🔥 ADD COMMENT HIT");
    console.log("BODY:", req.body);
    console.log("TICKET ID:", req.params.id);
    console.log("USER:", req.user);
  
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
  // 💬 MIRROR SUPPORT NOTE TO CHAT
  // ===============================
  const conversation = await Conversation.findOne({
    ticketId: ticket._id,
  });

  if (conversation && conversation.status !== "closed") {

    const chatMessage = await Message.create({
      conversationId: conversation._id,
      sender: req.user.id,
      senderRole: req.user.role || "admin",
      text: message,
    });


    conversation.lastMessage = message;
    conversation.updatedAt = new Date();

    await conversation.save();


    const io = req.app.get("io");


    if (io) {

      // Update open chat window
      io.to(conversation._id.toString()).emit(
        "receiveMessage",
        chatMessage
      );


      // Update conversation sidebar
      io.emit("conversationUpdated", {
        conversationId: conversation._id,
        lastMessage: message,
        updatedAt: new Date(),
      });

    }

  }

    // 📜 LOG ACTIVITY
    ticket.activityLogs.push({
      action: "Comment Added",
      performedBy: username,
      details: message,
    });

    const updatedTicket = await ticket.save();

    // ===============================
    // REAL-TIME UPDATE
    // ===============================
    const io = req.app.get("io");

    io.emit("ticketUpdated", updatedTicket);

    return res.json({
      message: "Comment added successfully",
      ticket: updatedTicket,
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ===============================
// ARCHIVE RESOLVED TICKETS
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
          "archivedBy.admin": true,
        }
      }
    );

    // ===============================
    // 🔒 CLOSE ARCHIVED CONVERSATIONS
    // ===============================
    await Conversation.updateMany(
      {
        ticketId: {
          $in: ticketIds,
        },
      },
      {
        status: "closed",
      }
    );

    const io = req.app.get("io");

    io.emit("ticketUpdated");

    res.json({
      message: "Tickets archived successfully",
      archivedCount: ticketIds.length
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

  // ===============================
  // UNARCHIVE TICKETS
  // ===============================

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
              "archivedBy.admin": false,
          }
        }
      );

      const io = req.app.get("io");

      io.emit("ticketUpdated");
      
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
  // 📦 USER ARCHIVE TICKET
  // ===============================
  const archiveMyTicket = async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({
          message: "Ticket not found",
        });
      }

      // User must own the ticket
      if (
        ticket.submittedBy.userId.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message: "Unauthorized",
        });
      }

      // Only resolved or closed tickets
      if (
        ticket.status !== "resolved" &&
        ticket.status !== "closed"
      ) {
        return res.status(400).json({
          message:
            "Only resolved or closed tickets can be archived.",
        });
      }

      ticket.archivedBy.user = true;
      ticket.archivedAt = new Date();

      ticket.activityLogs.push({
        action: "Ticket Archived",
        performedBy: req.user.id,
        details: "User archived the ticket.",
      });

      await ticket.save();

      const io = req.app.get("io");

      io.emit("ticketUpdated", ticket);

      return res.json({
        message: "Ticket archived successfully.",
        ticket,
      });

    } catch (err) {
      console.log("ARCHIVE MY TICKET:", err);

      return res.status(500).json({
        message: err.message,
      });
    }
  };

  // ===============================
  // 🗑 BULK DELETE ARCHIVED TICKETS
  // ===============================
  const deleteArchivedTickets = async (req, res) => {
    try {

      if (req.user?.role !== "admin") {
        return res.status(403).json({
          message: "Only admin can delete tickets"
        });
      }

      const { ticketIds } = req.body;

      if (!ticketIds || !Array.isArray(ticketIds)) {
        return res.status(400).json({
          message: "ticketIds array required"
        });
      }

      await Ticket.deleteMany({
        _id: { $in: ticketIds },
        status: "archived",
      });

      const io = req.app.get("io");

      io.emit("ticketUpdated");

      return res.json({
        message: "Tickets deleted successfully",
        deletedCount: ticketIds.length,
      });

    } catch (err) {
      console.log("DELETE ERROR:", err);

      return res.status(500).json({
        message: err.message,
      });
    }
  };

  // ===============================
  // 👤 USER DASHBOARD
  // ===============================
  const getMyDashboard = async (req, res) => {
    try {

      const tickets = await Ticket.find({
        "submittedBy.userId": req.user.id,
        "archivedBy.user": false,
        deletedByUser: false,
      }).sort({ createdAt: -1 });



      const messages = await Message.countDocuments({
        sender: req.user.id
      });



      const stats = {

        total: tickets.length,

        pending: tickets.filter(
          t => t.status === "pending"
        ).length,


        in_progress: tickets.filter(
          t => t.status === "in_progress"
        ).length,


        messages: messages,


        resolved: tickets.filter(
          t => t.status === "resolved"
        ).length,


        closed: tickets.filter(
          t => t.status === "closed"
        ).length,

      };



      const recentTickets = tickets.slice(0, 5);



      return res.json({

        stats,

        recentTickets,

      });



    } catch (err) {

      console.log(
        "USER DASHBOARD ERROR:",
        err
      );


      return res.status(500).json({

        message: err.message,

      });

    }
  };

  // ===============================
  // 👤 GET MY TICKETS
  // ===============================
  const getMyTickets = async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

  const tickets = await Ticket.find({
      "submittedBy.userId": req.user.id,
      "archivedBy.user": false,
      deletedByUser: false,
  });

      return res.json({
        count: tickets.length,
        tickets,
      });

    } catch (err) {
      console.log("GET MY TICKETS ERROR:", err);

      return res.status(500).json({
        message: err.message,
      });
    }
  };

  // ===============================
  // 📦 GET MY ARCHIVED TICKETS
  // ===============================
  const getMyArchivedTickets = async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

  const tickets = await Ticket.find({
      "submittedBy.userId": req.user.id,
      "archivedBy.user": true,
      deletedByUser: false,
  }).sort({ archivedAt: -1 });

      return res.json({
        count: tickets.length,
        tickets,
      });

    } catch (err) {

      console.log("GET MY ARCHIVED TICKETS:", err);

      return res.status(500).json({
        message: err.message,
      });

    }
  };

  // ===============================
  // 🗑 USER DELETE TICKET
  // ===============================
  const deleteMyTicket = async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({
          message: "Ticket not found",
        });
      }

      // Must own the ticket
      if (
        ticket.submittedBy.userId.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message: "Unauthorized",
        });
      }

      // Allow deleting:
      if (
        ticket.status !== "cancelled" &&
        !ticket.archivedBy.user
      ) {
        return res.status(400).json({
          message:
            "Only cancelled or archived tickets can be deleted.",
        });
      }

      ticket.deletedByUser = true;
      ticket.archivedBy.user = false;

      ticket.activityLogs.push({
        action: "Ticket Deleted",
        performedBy: req.user.id,
        details: "User removed the ticket from their records.",
      });

      await ticket.save();


      // ===============================
      // 🔒 CLOSE CONVERSATION
      // ===============================
      await Conversation.findOneAndUpdate(
        {
          ticketId: ticket._id,
        },
        {
          status: "closed",
        }
      );

      const io = req.app.get("io");

      io.emit("ticketUpdated");

      return res.json({
        message: "Ticket deleted successfully",
      });

    } catch (err) {
      console.log("DELETE MY TICKET:", err);

      return res.status(500).json({
        message: err.message,
      });
    }
  };

  // ===============================
  // 📦 USER UNARCHIVE TICKET
  // ===============================
  const unarchiveMyTicket = async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({
          message: "Ticket not found",
        });
      }

      // Must own ticket
      if (
        ticket.submittedBy.userId.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message: "Unauthorized",
        });
      }

      if (!ticket.archivedBy.user) {
        return res.status(400).json({
          message: "Ticket is not archived.",
        });
      }

      ticket.archivedBy.user = false;

      ticket.activityLogs.push({
        action: "Ticket Restored",
        performedBy: req.user.id,
        details: "User restored archived ticket.",
      });

      await ticket.save();

      const io = req.app.get("io");

      io.emit("ticketUpdated", ticket);

      return res.json({
        message: "Ticket restored successfully.",
        ticket,
      });

    } catch (err) {

      console.log("UNARCHIVE MY TICKET:", err);

      return res.status(500).json({
        message: err.message,
      });

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
  resolveTicket,
  reopenTicket,
  deleteTicket,
  deleteArchivedTickets,
  getTicketStats,
  getTicketsByStatus,
  getArchivedTickets,   
  getMyAssignedTickets,
  addTicketComment,
  archiveTickets,
  unarchiveTickets,
  getMyDashboard,
  getMyTickets,
  cancelTicket,
  deleteMyTicket,
  archiveMyTicket,
  unarchiveMyTicket,
  getMyArchivedTickets,
};