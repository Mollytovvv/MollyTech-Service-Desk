const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ===============================
// CREATE ANNOUNCEMENT
// ===============================
const createAnnouncement = async (req, res) => {
  try {

    const {
      title,
      content,
      type,
      pinned,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required.",
      });
    }

    const announcement = await Announcement.create({

      title,

      content,

      type: type || "info",

      pinned: pinned || false,

      createdBy: req.user.id,

    });

    // ===============================
    // CREATE USER NOTIFICATIONS
    // ===============================

    const users = await User.find({
      role: "user",
    }).select("_id");


    const notifications = await Notification.insertMany(

      users.map((user)=>({

        recipient:user._id,

        sender:req.user.id,

        type:"announcement",

        title:"New Announcement",

        message:title,

      }))

    );


    // ===============================
    // REALTIME EVENTS
    // ===============================

    const io = req.app.get("io");


    if(io){

      // ===============================
      // 🔔 USER NOTIFICATION BELL
      // ===============================

      notifications.forEach((notification)=>{

        io.to(
          notification.recipient.toString()
        )
        .emit(
          "notificationCreated",
          {
            ...notification.toObject(),
            isRead:false,
          }
        );

      });


      // ===============================
      // 📢 USER DASHBOARD ANNOUNCEMENTS
      // ===============================

      io.emit(
        "announcementCreated",
        announcement
      );

    }


    return res.status(201).json({

        message: "Announcement created successfully.",

        announcement,

    });

  } catch (err) {

    console.log(
      "CREATE ANNOUNCEMENT ERROR:",
      err
    );

    return res.status(500).json({

      message: err.message,

    });

  }
};

// ===============================
// GET ALL ANNOUNCEMENTS
// ===============================
const getAnnouncements = async (req, res) => {
  try {

    const query =
      req.user.role === "admin"
        ? {}
        : {
            active: true,
          };


    const announcements = await Announcement.find(query)

      .populate(
        "createdBy",
        "firstName lastName"
      )

      .sort({

        pinned: -1,

        createdAt: -1,

      });


    return res.json({

      announcements,

    });


  } catch (err) {

    console.log(
      "GET ANNOUNCEMENTS ERROR:",
      err
    );


    return res.status(500).json({

      message: err.message,

    });

  }
};

// ===============================
// GET SINGLE ANNOUNCEMENT
// ===============================
const getAnnouncementById = async (req, res) => {
  try {

    const announcement = await Announcement.findById(
      req.params.id
    ).populate(
      "createdBy",
      "firstName lastName"
    );

    if (!announcement) {

      return res.status(404).json({

        message: "Announcement not found.",

      });

    }

    return res.json({

      announcement,

    });

  } catch (err) {

    console.log(
      "GET ANNOUNCEMENT ERROR:",
      err
    );

    return res.status(500).json({

      message: err.message,

    });

  }
};

// ===============================
// UPDATE ANNOUNCEMENT
// ===============================
const updateAnnouncement = async (req, res) => {
  try {

    const announcement = await Announcement.findByIdAndUpdate(

      req.params.id,

      req.body,

      {

        new: true,

        runValidators: true,

      }

    );

    if (!announcement) {

      return res.status(404).json({

        message: "Announcement not found.",

      });

    }

  const io = req.app.get("io");

  if(io){

  io.emit(
    "announcementUpdated",
    announcement
  );

  }


  return res.json({

      message: "Announcement updated successfully.",

      announcement,

  });

  } catch (err) {

    console.log(
      "UPDATE ANNOUNCEMENT ERROR:",
      err
    );

    return res.status(500).json({

      message: err.message,

    });

  }
};

// ===============================
// DELETE ANNOUNCEMENT
// ===============================
const deleteAnnouncement = async (req, res) => {
  try {

    const announcement = await Announcement.findByIdAndDelete(
      req.params.id
    );

    if (!announcement) {

      return res.status(404).json({

        message: "Announcement not found.",

      });

    }

  const io = req.app.get("io");

  if(io){

  io.emit(
    "announcementDeleted",
    announcement._id
  );

  }


  return res.json({

      message: "Announcement deleted successfully.",

  });

  } catch (err) {

    console.log(
      "DELETE ANNOUNCEMENT ERROR:",
      err
    );

    return res.status(500).json({

      message: err.message,

    });

  }
};

// ===============================
// TOGGLE PIN
// ===============================
const togglePinned = async (req, res) => {
  try {

    const announcement = await Announcement.findById(
      req.params.id
    );

    if (!announcement) {

      return res.status(404).json({

        message: "Announcement not found.",

      });

    }

    announcement.pinned = !announcement.pinned;

    await announcement.save();

  const io = req.app.get("io");

  if(io){

  io.emit(
    "announcementUpdated",
    announcement
  );

  }


  return res.json({

      message: announcement.pinned
        ? "Announcement pinned."
        : "Announcement unpinned.",

      announcement,

  });

  } catch (err) {

    console.log(
      "PIN ANNOUNCEMENT ERROR:",
      err
    );

    return res.status(500).json({

      message: err.message,

    });

  }
};

// ===============================
// TOGGLE ACTIVE
// ===============================
const toggleActive = async (req, res) => {
  try {

    const announcement = await Announcement.findById(
      req.params.id
    );

    if (!announcement) {

      return res.status(404).json({

        message: "Announcement not found.",

      });

    }

    announcement.active = !announcement.active;

    await announcement.save();

  const io = req.app.get("io");

  if(io){

  io.emit(
    "announcementUpdated",
    announcement
  );

  }


  return res.json({

      message: announcement.active
        ? "Announcement activated."
        : "Announcement hidden.",

      announcement,

  });

  } catch (err) {

    console.log(
      "ACTIVE ANNOUNCEMENT ERROR:",
      err
    );

    return res.status(500).json({

      message: err.message,

    });

  }
};

// ===============================
// EXPORTS
// ===============================
module.exports = {

  createAnnouncement,

  getAnnouncements,

  getAnnouncementById,

  updateAnnouncement,

  deleteAnnouncement,

  togglePinned,

  toggleActive,

};