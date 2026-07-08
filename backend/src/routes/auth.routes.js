const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const {
  register,
  login,
  getUsers,
} = require("../controllers/auth.controller");

// ===============================
// GET ALL USERS (ADMIN)
// ===============================
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  getUsers
);

router.post("/register", register);
router.post("/login", login);

module.exports = router;