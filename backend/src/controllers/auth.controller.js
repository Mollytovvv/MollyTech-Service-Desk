// ===============================
// 📌 AUTH CONTROLLER
// ===============================

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");

const {
    sendPasswordResetEmail,
    sendPasswordChangedEmail
} = require("../services/email.service");

const Notification = require("../models/Notification");


// ===============================
// 🧾 REGISTER USER
// ===============================
const register = async (req, res) => {

    try {

        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            turnstileToken,
        } = req.body;


        // ===============================
        // REQUIRED FIELDS
        // ===============================

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !password
        ) {

            return res.status(400).json({

                message: "All fields are required"

            });

        }


        // ===============================
        // 🛡️ VERIFY CLOUDFLARE TURNSTILE
        // ===============================

        if (!turnstileToken) {

            return res.status(400).json({

                message:
                    "Security verification is required."

            });

        }


        try {

            const turnstileResponse = await axios.post(

                "https://challenges.cloudflare.com/turnstile/v0/siteverify",

                new URLSearchParams({

                    secret:
                        process.env.TURNSTILE_SECRET_KEY,

                    response:
                        turnstileToken

                }),

                {

                    headers: {

                        "Content-Type":
                            "application/x-www-form-urlencoded"

                    }

                }

            );


            if (!turnstileResponse.data.success) {

                console.log(
                    "TURNSTILE VERIFICATION FAILED:",
                    turnstileResponse.data
                );


                return res.status(403).json({

                    message:
                        "Security verification failed."

                });

            }

        }

        catch (turnstileError) {

            console.error(
                "TURNSTILE VERIFICATION ERROR:",
                turnstileError
            );


            return res.status(500).json({

                message:
                    "Security verification could not be completed."

            });

        }


        // ===============================
        // 📧 NORMALIZE USER DATA
        // ===============================

        const normalizedFirstName =
            firstName.trim();

        const normalizedLastName =
            lastName.trim();

        const normalizedEmail =
            email.trim().toLowerCase();


        // ===============================
        // 🔎 CHECK EXISTING USER
        // ===============================

        const existingUser = await User.findOne({

            email: normalizedEmail

        });


        if (existingUser) {

            return res.status(400).json({

                message: "Email already exists"

            });

        }


        // ===============================
        // 🔐 PASSWORD VALIDATION
        // ===============================

        if (password.length < 8) {

            return res.status(400).json({

                message:
                    "Password must be at least 8 characters"

            });

        }


        // ===============================
        // 🔒 HASH PASSWORD
        // ===============================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ===============================
        // 👤 CREATE USER
        // ===============================

        const user = await User.create({

            firstName:
                normalizedFirstName,

            lastName:
                normalizedLastName,

            email:
                normalizedEmail,

            phone,

            password:
                hashedPassword,

            role:
                "user",

            status:
                "pending",

        });


        // ===============================
        // CREATE ACCESS REQUEST NOTIFICATION
        // ===============================

        const admin = await User.findOne({

            role: "admin"

        });


        if (admin) {

            const notification =
                await Notification.create({

                    recipient:
                        admin._id,

                    sender:
                        user._id,

                    type:
                        "access_request",

                    title:
                        "New Access Request",

                    message:
                        `${user.firstName} ${user.lastName} submitted an account registration request.`

                });


            // ===============================
            // REALTIME NOTIFICATION EMIT
            // ===============================

            const populatedNotification =
                await Notification.findById(
                    notification._id
                )
                .populate(
                    "sender",
                    "_id firstName lastName role"
                );


            const io =
                req.app.get("io");


            if (io) {

                io.to(
                    admin._id.toString()
                )
                .emit(
                    "notificationCreated",
                    populatedNotification
                );


                console.log(
                    "Admin notification sent:",
                    admin.email
                );

            }

        }


        // ===============================
        // REALTIME ACCESS REQUEST
        // ===============================

        const io =
            req.app.get("io");


        console.log(
            "SOCKET IO:",
            !!io
        );


        if (io) {

            io.to("admins").emit(

                "newAccessRequest",

                {

                    userId:
                        user._id,

                    firstName:
                        user.firstName,

                    lastName:
                        user.lastName,

                    email:
                        user.email

                }

            );


            io.to("admins")
                .emit(
                    "accessRequestUpdated"
                );


            io.emit(

                "newUser",

                {

                    _id:
                        user._id,

                    firstName:
                        user.firstName,

                    lastName:
                        user.lastName,

                    email:
                        user.email,

                    phone:
                        user.phone,

                    role:
                        user.role,

                    status:
                        user.status,

                    createdAt:
                        user.createdAt

                }

            );


            console.log(

                "New access request emitted:",

                user.email

            );

        }


        // ===============================
        // SEND RESPONSE TO FRONTEND
        // ===============================

        return res.status(201).json({

            message:
                "Registration submitted successfully. Please wait for administrator approval."

        });


    }

    catch (err) {

        console.error(

            "REGISTER ERROR:",
            err

        );


        return res.status(500).json({

            message:
                err.message

        });

    }

};


// ===============================
// 🔐 LOGIN USER
// ===============================
const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ===============================
        // REQUIRED FIELDS
        // ===============================

        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Email and password are required"

            });

        }


        // ===============================
        // 📧 NORMALIZE EMAIL
        // ===============================

        const normalizedEmail =
            email.trim().toLowerCase();


        // ===============================
        // 🔎 FIND USER
        // ===============================

        const user = await User.findOne({

            email:
                normalizedEmail

        });


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        // ===============================
        // ACCOUNT APPROVAL CHECK
        // ===============================

        if (
            user.role === "user" &&
            user.status !== "approved"
        ) {

            return res.status(403).json({

                message:

                    user.status === "rejected"

                        ?

                        "Your account registration was declined."

                        :

                        "Your account is still waiting for administrator approval."

            });

        }


        // ===============================
        // 🔐 VERIFY PASSWORD
        // ===============================

        const isMatch =
            await bcrypt.compare(

                password,
                user.password

            );


        if (!isMatch) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        // ===============================
        // 🎫 CREATE JWT
        // ===============================

        const token =
            jwt.sign(

                {

                    id:
                        user._id,

                    firstName:
                        user.firstName || "",

                    lastName:
                        user.lastName || "",

                    email:
                        user.email,

                    role:
                        user.role,

                    status:
                        user.status

                },

                process.env.JWT_SECRET,

                {

                    expiresIn:
                        "1d"

                }

            );


        // ===============================
        // SEND RESPONSE
        // ===============================

        return res.json({

            message:
                "Login successful",

            token,

            user: {

                _id:
                    user._id,

                firstName:
                    user.firstName || "",

                lastName:
                    user.lastName || "",

                email:
                    user.email,

                phone:
                    user.phone || "",

                role:
                    user.role,

                status:
                    user.status

            }

        });


    }

    catch (err) {

        console.error(
            "LOGIN ERROR:",
            err
        );


        return res.status(500).json({

            message:
                err.message

        });

    }

};


// ===============================
// 🔐 FORGOT PASSWORD
// ===============================
const forgotPassword = async (req, res) => {

    try {

        const {
            email
        } = req.body;


        // ===============================
        // REQUIRED FIELD
        // ===============================

        if (!email) {

            return res.status(400).json({

                message:
                    "Email is required"

            });

        }


        // ===============================
        // 📧 NORMALIZE EMAIL
        // ===============================

        const normalizedEmail =
            email.trim().toLowerCase();


        // ===============================
        // 🔎 FIND USER
        // ===============================

        const user = await User.findOne({

            email:
                normalizedEmail

        });


        // ===============================
        // PREVENT EMAIL ENUMERATION
        // ===============================

        if (!user) {

            return res.json({

                message:
                    "If the email exists, a password reset link has been sent."

            });

        }


        // ===============================
        // 🔑 GENERATE RESET TOKEN
        // ===============================

        const resetToken =
            crypto
                .randomBytes(32)
                .toString("hex");


        user.passwordResetToken =
            resetToken;


        user.passwordResetExpires =
            Date.now() +
            60 * 60 * 1000;


        await user.save();


        // ===============================
        // 🔗 CREATE RESET LINK
        // ===============================

        const resetLink =
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`;


        // ===============================
        // 📧 SEND EMAIL
        // ===============================

        await sendPasswordResetEmail({

            email:
                user.email,

            resetLink

        });


        return res.json({

            message:
                "If the email exists, a password reset link has been sent."

        });


    }

    catch (err) {

        console.error(

            "FORGOT PASSWORD ERROR:",
            err

        );


        return res.status(500).json({

            message:
                err.message

        });

    }

};


// ===============================
// 🔑 RESET PASSWORD
// ===============================
const resetPassword = async (req, res) => {

    try {

        const {
            token
        } = req.params;


        const {
            password,
            confirmPassword
        } = req.body;


        // ===============================
        // REQUIRED FIELDS
        // ===============================

        if (
            !password ||
            !confirmPassword
        ) {

            return res.status(400).json({

                message:
                    "All fields are required"

            });

        }


        // ===============================
        // PASSWORD MATCH
        // ===============================

        if (
            password !==
            confirmPassword
        ) {

            return res.status(400).json({

                message:
                    "Passwords do not match"

            });

        }


        // ===============================
        // PASSWORD LENGTH
        // ===============================

        if (
            password.length < 8
        ) {

            return res.status(400).json({

                message:
                    "Password must be at least 8 characters"

            });

        }


        // ===============================
        // 🔎 FIND VALID RESET TOKEN
        // ===============================

        const user =
            await User.findOne({

                passwordResetToken:
                    token,

                passwordResetExpires: {

                    $gt:
                        Date.now()

                }

            });


        if (!user) {

            return res.status(400).json({

                message:
                    "Invalid or expired password reset link"

            });

        }


        // ===============================
        // 🔎 PREVENT SAME PASSWORD
        // ===============================

        const isSamePassword =
            await bcrypt.compare(

                password,
                user.password

            );


        if (isSamePassword) {

            return res.status(400).json({

                message:
                    "New password must be different from your current password"

            });

        }


        // ===============================
        // 🔒 HASH NEW PASSWORD
        // ===============================

        user.password =
            await bcrypt.hash(

                password,
                10

            );


        // ===============================
        // 🧹 CLEAR RESET TOKEN
        // ===============================

        user.passwordResetToken =
            null;

        user.passwordResetExpires =
            null;


        await user.save();


        return res.json({

            message:
                "Password has been reset successfully"

        });


    }

    catch (err) {

        console.error(

            "RESET PASSWORD ERROR:",
            err

        );


        return res.status(500).json({

            message:
                err.message

        });

    }

};


// ===============================
// 🔑 CHANGE PASSWORD
// ===============================
const changePassword = async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;


        // ===============================
        // REQUIRED FIELDS
        // ===============================

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            return res.status(400).json({

                message:
                    "All fields are required"

            });

        }


        // ===============================
        // PASSWORD MATCH
        // ===============================

        if (
            newPassword !==
            confirmPassword
        ) {

            return res.status(400).json({

                message:
                    "New passwords do not match"

            });

        }


        // ===============================
        // PASSWORD LENGTH
        // ===============================

        if (
            newPassword.length < 8
        ) {

            return res.status(400).json({

                message:
                    "Password must be at least 8 characters"

            });

        }


        // ===============================
        // 🔎 FIND USER
        // ===============================

        const user =
            await User.findById(

                req.user.id

            );


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        // ===============================
        // 🔐 VERIFY CURRENT PASSWORD
        // ===============================

        const isMatch =
            await bcrypt.compare(

                currentPassword,
                user.password

            );


        if (!isMatch) {

            return res.status(401).json({

                message:
                    "Current password is incorrect"

            });

        }


        // ===============================
        // 🔎 PREVENT SAME PASSWORD
        // ===============================

        const isSamePassword =
            await bcrypt.compare(

                newPassword,
                user.password

            );


        if (isSamePassword) {

            return res.status(400).json({

                message:
                    "New password must be different from your current password"

            });

        }


        // ===============================
        // 🔒 HASH NEW PASSWORD
        // ===============================

        user.password =
            await bcrypt.hash(

                newPassword,
                10

            );


        await user.save();


        // ===============================
        // 📧 PASSWORD CHANGE NOTIFICATION
        // ===============================

        try {

            await sendPasswordChangedEmail({

                email:
                    user.email,

                role:
                    user.role

            });

        }

        catch (emailError) {

            console.error(

                "PASSWORD CHANGE EMAIL ERROR:",
                emailError

            );

        }


        return res.json({

            message:
                "Password updated successfully"

        });


    }

    catch (err) {

        console.error(

            "CHANGE PASSWORD ERROR:",
            err

        );


        return res.status(500).json({

            message:
                err.message

        });

    }

};


// ===============================
// 👥 GET ALL USERS
// ===============================
const getUsers = async (req, res) => {

    try {

        const users =
            await User.find()

                .select("-password")

                .sort({

                    createdAt:
                        -1

                });


        return res.json({

            count:
                users.length,

            users

        });


    }

    catch (err) {

        console.error(

            "GET USERS ERROR:",
            err

        );


        return res.status(500).json({

            message:
                err.message

        });

    }

};


// ===============================
// EXPORTS
// ===============================
module.exports = {

    register,
    login,
    forgotPassword,
    resetPassword,
    changePassword,
    getUsers

};