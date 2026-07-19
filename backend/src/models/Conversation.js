const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },

    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        role: {
          type: String,
          default: "user",
        },
      },
    ],

    lastMessage: {
      type: String,
      default: "",
    },
    adminUnread: {
      type: Boolean,
      default: false,
    },

    userUnread: {
      type: Boolean,
      default: false,
    },
    
    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);