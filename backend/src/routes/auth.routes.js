const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const {
  authMiddleware
} = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getUsers,
} = require("../controllers/auth.controller");

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many registration attempts. Please try again later."
    }
});

// ===============================
// 🧾 REGISTER
// ===============================
router.post(
    "/register",
    registerLimiter,
    register
);

// ===============================
// 🔐 LOGIN
// ===============================
router.post("/login", login);

// ===============================
// 🔐 FORGOT PASSWORD
// ===============================
router.post(
  "/forgot-password",
  forgotPassword
);

// ===============================
// 🔑 RESET PASSWORD
// ===============================
router.post(
  "/reset-password/:token",
  resetPassword
);

// ===============================
// 🔑 CHANGE PASSWORD
// ===============================
router.patch(
  "/change-password",
  authMiddleware,
  changePassword
);

// ===============================
// 👥 GET ALL USERS (ADMIN)
// ===============================
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  getUsers
);


module.exports = router;