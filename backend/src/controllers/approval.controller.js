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
const approveUser = async(req,res)=>{

    try{

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

                message:"Only user registrations can be approved"

            });

        }

        if(user.status === "approved"){

            return res.status(400).json({

                message:"User is already approved"

            });

        }

        user.status = "approved";

        user.approvedAt = new Date();

        user.rejectedAt = null;

        user.rejectedReason = "";

        await user.save();


        // ===============================
        // SEND ACCOUNT APPROVAL EMAIL
        // ===============================

        await sendApprovalEmail({

            email:user.email,

            firstName:user.firstName,

            loginLink:
            process.env.CLIENT_URL || "http://localhost:5173"

        });

        const io = req.app.get("io");

        if(io){

            io.emit(
                "accessRequestUpdated",
                {

                    action:"approved",

                    userId:user._id

                }
            );

        }

        res.json({

            message:"User approved successfully",

            user:{

                id:user._id,

                firstName:user.firstName,

                lastName:user.lastName,

                email:user.email,

                status:user.status

            }

        });

    }
    catch(err){

        console.error(
            "Approve user error:",
            err
        );

        res.status(500).json({

            message:"Failed to approve user"

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

                    userId:user._id

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