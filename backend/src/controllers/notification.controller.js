const Notification = require("../models/Notification");

// ===============================
// 📥 GET NOTIFICATIONS
// ===============================
const getNotifications = async (req, res) => {

  try {

    const notifications =
      await Notification.find({
        recipient: req.user.id,
      })
      .populate(
        "sender",
        "_id firstName lastName role"
      )
      .populate(
        "ticketId",
        "ticketId title status"
      )
      .sort({
        createdAt: -1,
      })
      .limit(50);

    return res.json({
      count: notifications.length,
      notifications,
    });

  } catch (err) {

    console.log(
      "GET NOTIFICATIONS ERROR:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });

  }

};

// ===============================
// ✅ MARK AS READ
// ===============================
const markAsRead = async (req, res) => {
  try {

    const notification = await Notification.findById(
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    if (
      notification.recipient.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.json({
      message: "Notification marked as read",
      notification,
    });

  } catch (err) {

    console.log("MARK READ ERROR:", err);

    return res.status(500).json({
      message: err.message,
    });

  }
};

// ===============================
// ✅ MARK ALL AS READ
// ===============================
const markAllAsRead = async (req, res) => {
  try {

    await Notification.updateMany(
      {
        recipient: req.user.id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.json({
      message: "All notifications marked as read",
    });

  } catch (err) {

    console.log("MARK ALL READ ERROR:", err);

    return res.status(500).json({
      message: err.message,
    });

  }
};

// ===============================
// 🔔 CREATE NOTIFICATION
// ===============================
const createNotification = async (req, res) => {
  try {

    const {
      recipient,
      type,
      title,
      message,
      ticketId,
    } = req.body;

    if (!recipient || !title || !message) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const notification = await Notification.create({
      recipient,
      sender: req.user.id,
      type,
      title,
      message,
      ticketId: ticketId || null,
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

    const io = req.app.get("io");

    if (io) {
      io.to(recipient).emit(
        "notificationCreated",
        populatedNotification
      );
    }

    return res.status(201).json({
      message: "Notification created successfully",
      data: populatedNotification,
    });

  } catch (err) {

    console.log(
      "CREATE NOTIFICATION ERROR:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });

  }
};

// ===============================
// 🗑 DELETE NOTIFICATION
// ===============================
const deleteNotification = async (req, res) => {
  try {

    const notification = await Notification.findById(
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    if (
      notification.recipient.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await notification.deleteOne();

    return res.json({
      message: "Notification deleted successfully",
    });

  } catch (err) {

    console.log("DELETE NOTIFICATION ERROR:", err);

    return res.status(500).json({
      message: err.message,
    });

  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};