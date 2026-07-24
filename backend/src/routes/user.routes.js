const express = require("express");

const router = express.Router();

const {
    getProfile,
    updateProfile
} = require("../controllers/user.controller");

const authMiddleware = require("../middleware/auth.middleware");


router.get(
    "/me",
    authMiddleware,
    getProfile
);


router.patch(
    "/update-profile",
    authMiddleware,
    updateProfile
);


module.exports = router;