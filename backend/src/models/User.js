const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: function () {
        return this.role === "user" || this.role === "technician";
      },
      trim: true,
    },

    lastName: {
      type: String,
      required: function () {
        return this.role === "user" || this.role === "technician";
      },
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "technician", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);