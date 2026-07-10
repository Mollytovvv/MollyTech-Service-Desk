const mongoose = require("mongoose");

// ===============================
// 💬 COMMENT SUB-SCHEMA
// ===============================
const commentSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },

  message: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ===============================
// 📜 ACTIVITY LOG SUB-SCHEMA
// ===============================
const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },

  performedBy: {
    type: String,
    required: true,
  },

  details: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

  // PHONE NUMBER SCHEMA
  const formatPHNumber = (number) => {
    if (!number) return "N/A";

    // remove spaces, dashes, parentheses
    let cleaned = number.replace(/\D/g, "");

    // handle local PH formats
    if (cleaned.startsWith("63")) {
      cleaned = cleaned.slice(2);
    }

    if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1);
    }

    // ensure 10-digit mobile number
    if (cleaned.length !== 10) return number;

    return `+63 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  };

// ===============================
// 🎫 TICKET SCHEMA
// ===============================
const ticketSchema = new mongoose.Schema(
  {

    ticketId: {
      type: String,
      unique: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    submittedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      firstName: {
        type: String,
        required: true,
      },

      lastName: {
        type: String,
        required: true,
      },
    },

    email: {
      type: String,
      default: "N/A",
      trim: true,
    },

    phoneNumber: {
      type: String,
      default: "N/A",
      trim: true,
    },    

    category: {
      type: String,
      enum: ["software", "hardware", "network", "account", "bug", "other"],
      default: "other",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "in_progress",
        "resolved",
        "closed",
        "archived",
      ],
      default: "pending",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "low",
    },

    assignedTo: {
      type: String,
      default: null,
    },

    // ===============================
    // 💬 SAFE ARRAYS
    // ===============================
    comments: {
      type: [commentSchema],
      default: [],
    },

    activityLogs: {
      type: [activitySchema],
      default: [],
    },

    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.pre("save", function (next) {
  if (!this.ticketId) {
    this.ticketId = "#" + this._id.toString().slice(-6);
  }
});

module.exports = mongoose.model("Ticket", ticketSchema);