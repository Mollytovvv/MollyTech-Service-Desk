const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },

    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
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

    status: {
      type: String,
      enum: [
        "active",
        "closed"
      ],
      default: "active",
    },

    unreadBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);


// =====================================
// INDEXES
// =====================================

// Faster ticket lookup


// Faster user conversation lookup
conversationSchema.index({
  "participants.userId": 1,
});


// Faster sorting for recent conversations
conversationSchema.index({
  updatedAt: -1,
});


module.exports =
  mongoose.models.Conversation ||
  mongoose.model(
    "Conversation",
    conversationSchema
  );