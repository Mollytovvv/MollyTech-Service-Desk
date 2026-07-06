const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ===============================
// UPLOAD DIRECTORY
// ===============================
const uploadPath = path.join(__dirname, "../../uploads/messages");

// Create folder if it doesn't exist
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ===============================
// STORAGE CONFIGURATION
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// ===============================
// ALLOWED FILE TYPES
// ===============================
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",

    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Excel
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // PowerPoint
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // Text
    "text/plain",

    // Archives
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",

    // Logs
    "application/octet-stream",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

// ===============================
// MULTER INSTANCE
// ===============================
const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

module.exports = upload;