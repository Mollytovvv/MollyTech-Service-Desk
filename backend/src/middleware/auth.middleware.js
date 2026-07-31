// ===============================
// 🔐 AUTH MIDDLEWARE - JWT PROTECTION
// ===============================

const jwt = require("jsonwebtoken");

// ===============================
// 🛡 AUTH CHECK
// ===============================
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("🔐 decoded user:", decoded);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName || "",
      lastName: decoded.lastName || "",
    };

    next();
  } catch (err) {
    console.log("❌ auth error:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// ===============================
// 🔒 ROLE AUTHORIZATION
// ===============================
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

// ===============================
// EXPORTS
// ===============================
module.exports = {
  authMiddleware,
  authorizeRoles,
};