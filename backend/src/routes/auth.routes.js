const express = require("express");
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

// ===============================
// 🧾 REGISTER
// ===============================
router.post("/register", register);

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