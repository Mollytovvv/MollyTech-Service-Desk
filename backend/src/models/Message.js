const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderRole: {
      type: String,
      enum: [
        "user",
        "admin",
        "support",
        "it_support",
        "technician",
        "system",
      ],
      default: "user",
    },

    text: {
      type: String,
      default: "",
      trim: true,
    },

    attachment: {
      filename: String,
      originalname: String,
      mimetype: String,
      size: Number,
      url: String,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize loading conversation messages
messageSchema.index({
  conversationId: 1,
  createdAt: 1,
});

module.exports =
  mongoose.models.Message ||
  mongoose.model("Message", messageSchema);