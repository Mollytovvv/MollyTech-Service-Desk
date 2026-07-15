const express = require("express");
const router = express.Router();

const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  cancelTicket,
  resolveTicket,
  assignTicket,
  reopenTicket,
  deleteTicket,
  deleteMyTicket,
  unarchiveMyTicket,
  archiveMyTicket,
  getTicketsByStatus,
  getMyAssignedTickets,
  addTicketComment,
  archiveTickets,
  unarchiveTickets,
  deleteArchivedTickets,
  getMyTickets,
  getMyDashboard,
  getMyArchivedTickets,
} = require("../controllers/ticket.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// ===============================
// USER DASHBOARD
// ===============================
router.get(
  "/my/dashboard",
  authMiddleware,
  roleMiddleware("user"),
  getMyDashboard
);

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
// CANCEL TICKET
// ===============================
router.patch(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware("user"),
  cancelTicket
);

// ===============================
// USER ARCHIVE TICKET
// ===============================
router.patch(
  "/my/:id/archive",
  authMiddleware,
  roleMiddleware("user"),
  archiveMyTicket
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

router.delete(
  "/delete",
  authMiddleware,
  roleMiddleware("admin"),
  deleteArchivedTickets
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("user"),
  getMyTickets
);

// ===============================
// USER ARCHIVED TICKETS
// ===============================
router.get(
  "/my/archived",
  authMiddleware,
  roleMiddleware("user"),
  getMyArchivedTickets
);

// ===============================
// USER UNARCHIVE TICKET
// ===============================
router.patch(
  "/my/:id/unarchive",
  authMiddleware,
  roleMiddleware("user"),
  unarchiveMyTicket
);

// ===============================
// UPDATE / ASSIGN / RESOLVE / REOPEN
// ===============================
router.get(
  "/:id",
  authMiddleware,
  getTicketById
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("user", "admin"),
  updateTicket
);

// ===============================
// ASSIGN
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
  resolveTicket
);

// ===============================
// USER DELETE TICKET
// ===============================
router.delete(
  "/my/:id",
  authMiddleware,
  roleMiddleware("user"),
  deleteMyTicket
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