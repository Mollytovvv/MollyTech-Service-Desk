// ===============================
// 📌 APPROVAL CONTROLLER
// MollyTech Service Desk
// ===============================


const User = require("../models/User");



// ===============================
// GET PENDING USERS
// ===============================
const getPendingUsers = async (req, res) => {

    try {

        const users = await User.find({

            role: "user",

            status: "pending"

        })

        .select("-password")

        .sort({

            createdAt:-1

        });



        res.json({

            count: users.length,

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
const approveUser = async (req,res)=>{

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
// VALIDATE USER ACCOUNT
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

        user.declinedAt = null;

        user.declinedReason = "";



        await user.save();



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
// VALIDATE USER ACCOUNT
// ===============================

if(user.role !== "user"){

    return res.status(400).json({

        message:"Only user registrations can be declined"

    });

}


if(user.status === "declined"){

    return res.status(400).json({

        message:"User is already declined"

    });

}

        user.status = "declined";

        user.declinedAt = new Date();

        user.approvedAt = null;

        user.declinedReason = reason || "No reason provided";



        await user.save();



        res.json({

            message:"User declined successfully",

            user:{
                id:user._id,
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                status:user.status,
                declinedReason:user.declinedReason
            }

        });



    }
    catch(err){

        console.error(
            "Decline user error:",
            err
        );


        res.status(500).json({

            message:"Failed to decline user"

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