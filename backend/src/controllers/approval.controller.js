// ===============================
// 📌 APPROVAL CONTROLLER
// MollyTech Service Desk
// ===============================

const User = require("../models/User");

const {
    sendApprovalEmail
} = require("../services/email.service");

// ===============================
// GET PENDING USERS
// ===============================
const getPendingUsers = async (req, res) => {

    try {

        const users = await User.find({

            role:"user",

            status:"pending"

        })

        .select("-password")

        .sort({

            createdAt:-1

        });



        res.json({

            count:users.length,

            users

        });

    }
    catch(err){

        console.error(
            "Get pending users error:",
            err
        );


        res.status(500).json({

            message:"Failed to fetch pending users"

        });

    }

};

// ===============================
// APPROVE USER
// ===============================
const approveUser = async (req, res) => {

    try {

        const user = await User.findById(
            req.params.id
        );

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        // ===============================
        // VALIDATE ACCOUNT
        // ===============================

        if (user.role !== "user") {

            return res.status(400).json({
                message:
                "Only user registrations can be approved"
            });

        }

        if (user.status === "approved") {

            return res.status(400).json({
                message:
                "User is already approved"
            });

        }

        // ===============================
        // APPROVE ACCOUNT
        // ===============================

        user.status = "approved";

        user.approvedAt = new Date();

        user.rejectedAt = null;

        user.rejectedReason = "";

        await user.save();

        // ===============================
        // REALTIME ACCESS REQUEST UPDATE
        // ===============================

        const io = req.app.get("io");

        if (io) {

            io.emit(
                "accessRequestUpdated",
                {
                    action: "approved",
                    userId: user._id.toString()
                }
            );

        }

        // ===============================
        // SEND ACCOUNT APPROVAL EMAIL
        // ===============================

        let emailSent = false;

        try {

            const clientUrl =
                process.env.CLIENT_URL ||
                "http://localhost:5173";

            await sendApprovalEmail({

                email: user.email,

                firstName: user.firstName,

                loginLink: clientUrl

            });

            emailSent = true;

        }
        catch (emailError) {

            console.error(
                "APPROVAL EMAIL FAILED:",
                emailError
            );

        }

        // ===============================
        // RESPONSE
        // ===============================

        return res.status(200).json({

            message:
            emailSent
                ? "User approved successfully"
                : "User approved successfully, but the approval email could not be sent",

            emailSent,

            user: {

                id: user._id,

                firstName:
                user.firstName,

                lastName:
                user.lastName,

                email:
                user.email,

                status:
                user.status

            }

        });

    }
    catch (err) {

        console.error(
            "Approve user error:",
            err
        );

        return res.status(500).json({

            message:
            "Failed to approve user"

        });

    }

};

// ===============================
// DECLINE USER
// ===============================
const declineUser = async(req,res)=>{

    try{

        const {
            reason
        } = req.body;


        const user = await User.findById(
            req.params.id
        );

        if(!user){

            return res.status(404).json({

                message:"User not found"

            });

        }

        // ===============================
        // VALIDATE ACCOUNT
        // ===============================

        if(user.role !== "user"){

            return res.status(400).json({

                message:"Only user registrations can be rejected"

            });

        }

        if(user.status === "rejected"){

            return res.status(400).json({

                message:"User is already rejected"

            });

        }

        user.status = "rejected";

        user.rejectedAt = new Date();

        user.approvedAt = null;

        user.rejectedReason =
            reason || "No reason provided";

        await user.save();

        // ===============================
        // REALTIME ACCESS REQUEST UPDATE
        // ===============================

        const io = req.app.get("io");

        if(io){

            io.emit(
                "accessRequestUpdated",
                {

                    action:"rejected",

                    userId:user._id.toString()

                }
            );

        }

        res.json({

            message:"User rejected successfully",

            user:{

                id:user._id,

                firstName:user.firstName,

                lastName:user.lastName,

                email:user.email,

                status:user.status,

                rejectedReason:user.rejectedReason

            }

        });

    }
    catch(err){

        console.error(
            "Reject user error:",
            err
        );


        res.status(500).json({

            message:"Failed to reject user"

        });

    }

};


// ===============================
// EXPORTS
// ===============================

module.exports = {

    getPendingUsers,

    approveUser,

    declineUser

};