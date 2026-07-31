const express = require("express");

const router = express.Router();

const {
    getProfile,
    updateProfile,
    getStaffMembers
} = require("../controllers/user.controller");

const {
  authMiddleware
} = require("../middleware/auth.middleware");


router.get(
    "/me",
    authMiddleware,
    getProfile
);

router.get(
    "/staff",
    authMiddleware,
    getStaffMembers
);

router.patch(
    "/update-profile",
    authMiddleware,
    updateProfile
);


module.exports = router;