const express = require("express");
const router = express.Router();

const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  assignTicket,
  reopenTicket,
  deleteTicket,
  getTicketsByStatus,
  getMyAssignedTickets,
  addTicketComment,
  archiveTickets,
  unarchiveTickets
} = require("../controllers/ticket.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");


// ===============================
// PUBLIC READ ROUTES
// ===============================
router.get("/", getTickets);


// ===============================
// SPECIFIC ROUTES (MUST BE BEFORE /:id)
// ===============================
router.get(
  "/status/:status",
  authMiddleware,
  roleMiddleware("admin"),
  getTicketsByStatus
);

router.get(
  "/my/assigned",
  authMiddleware,
  roleMiddleware("technician", "admin"),
  getMyAssignedTickets
);


// ===============================
// CREATE TICKET
// ===============================
router.post(
  "/",
  authMiddleware,
  roleMiddleware("user", "admin", "technician"),
  createTicket
);


// ===============================
// COMMENT
// ===============================
router.post(
  "/:id/comment",
  authMiddleware,
  roleMiddleware("user", "technician", "admin"),
  addTicketComment
);


// ===============================
// ARCHIVE
// ===============================
router.patch(
  "/archive",
  authMiddleware,
  roleMiddleware("admin"),
  archiveTickets
);


// ===============================
// UNARCHIVE (FIXED)
// ===============================
router.patch(
  "/unarchive",
  authMiddleware,
  roleMiddleware("admin"),
  unarchiveTickets
);


// ===============================
// GET SINGLE TICKET
// ===============================
router.get("/:id", getTicketById);


// ===============================
// UPDATE / ASSIGN / RESOLVE / REOPEN
// ===============================
router.patch(
  "/:id/assign",
  authMiddleware,
  roleMiddleware("admin"),
  assignTicket
);

router.patch(
  "/:id/reopen",
  authMiddleware,
  roleMiddleware("admin", "technician"),
  reopenTicket
);

router.patch(
  "/:id/resolve",
  authMiddleware,
  roleMiddleware("admin", "technician"),
  updateTicket
);


// ===============================
// DELETE
// ===============================
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteTicket
);

module.exports = router;