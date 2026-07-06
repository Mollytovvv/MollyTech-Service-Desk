// ===============================
// 📌 AUTH CONTROLLER
// ===============================

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
// 🧾 REGISTER USER
// ===============================
const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 🔐 HASH PASSWORD (VERY IMPORTANT)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// 🔐 LOGIN USER
// ===============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
    {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1d",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// 📦 EXPORTS
// ===============================
module.exports = {
  register,
  login
};