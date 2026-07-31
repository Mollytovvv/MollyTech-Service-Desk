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
  getArchivedTickets,
  getMyAssignedTickets,
  addTicketComment,
  archiveTickets,
  unarchiveTickets,
  deleteArchivedTickets,
  getMyTickets,
  getMyDashboard,
  getMyArchivedTickets,
} = require("../controllers/ticket.controller");

const {
  authMiddleware,
} = require("../middleware/auth.middleware");

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
// STAFF TICKET LIST
// ===============================
router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "admin",
    "technician",
    "support"
  ),
  getTickets
);

// ===============================
// ADMIN ARCHIVED TICKETS
// ===============================
router.get(
  "/status/archived",
  authMiddleware,
  roleMiddleware("admin"),
  getArchivedTickets
);

// ===============================
// FILTER BY STATUS
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
  roleMiddleware("technician", "support", "admin"),
  getMyAssignedTickets
);


// ===============================
// CREATE TICKET
// USER / ADMIN ONLY
// ===============================
router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "user",
    "admin"
  ),
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
  roleMiddleware("user", "technician", "support", "admin"),
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

// VIEW SINGLE TICKET
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "technician",
    "support",
    "user"
  ),
  getTicketById
);


// UPDATE TICKET DETAILS
// User can update own ticket
// Staff can update tickets they handle
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "user",
    "admin",
    "technician",
    "support"
  ),
  updateTicket
);

// ===============================
// ASSIGN TICKET
// ADMIN ONLY
// ===============================
router.patch(
  "/:id/assign",
  authMiddleware,
  roleMiddleware(
    "admin"
  ),
  assignTicket
);


// ===============================
// REOPEN TICKET
// ADMIN / TECHNICIAN / SUPPORT
// ===============================
router.patch(
  "/:id/reopen",
  authMiddleware,
  roleMiddleware(
    "admin",
    "technician",
    "support"
  ),
  reopenTicket
);

// ===============================
// RESOLVE TICKET
// ADMIN / TECHNICIAN / SUPPORT
// ===============================
router.patch(
  "/:id/resolve",
  authMiddleware,
  roleMiddleware(
    "admin",
    "technician",
    "support"
  ),
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