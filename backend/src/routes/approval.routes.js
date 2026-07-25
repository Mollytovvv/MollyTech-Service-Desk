// ===============================
// 📌 APPROVAL ROUTES
// MollyTech Service Desk
// ===============================


const express = require("express");

const router = express.Router();


const {

    getPendingUsers,

    approveUser,

    declineUser

} = require("../controllers/approval.controller");


const authMiddleware = require("../middleware/auth.middleware");



// ===============================
// GET PENDING REGISTRATIONS
// ===============================

router.get(

    "/pending",

    authMiddleware,

    getPendingUsers

);



// ===============================
// APPROVE USER
// ===============================

router.patch(

    "/:id/approve",

    authMiddleware,

    approveUser

);



// ===============================
// DECLINE USER
// ===============================

router.patch(

    "/:id/decline",

    authMiddleware,

    declineUser

);



module.exports = router;