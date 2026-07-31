const express = require("express");
const router = express.Router();

const {
  authMiddleware
} = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const {
  register,
  login,
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