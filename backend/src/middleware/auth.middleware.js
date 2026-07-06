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

    // ✅ DEBUG (remove later if you want)
    console.log("🔐 decoded user:", decoded);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName || "Unknown",
      lastName: decoded.lastName || "User",
    };

    return next();
  } catch (err) {
    console.log("❌ auth error:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;