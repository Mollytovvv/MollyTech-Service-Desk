const User = require("../models/User");


// ===============================
// GET USER PROFILE
// ===============================
const getProfile = async (req, res) => {

    try {

        const user = await User
            .findById(req.user.id)
            .select("-password");


        if (!user) {

            return res.status(404).json({

                message:"User not found"

            });

        }


        res.json(user);


    } catch (err) {

        console.error(
            "Get profile error:",
            err
        );


        res.status(500).json({

            message:"Failed to fetch profile"

        });

    }

};





// ===============================
// UPDATE USER PROFILE
// ===============================
const updateProfile = async (req, res) => {

    try {

        const {
            email,
            phone
        } = req.body;


        const user = await User.findById(
            req.user.id
        );


        if (!user) {

            return res.status(404).json({

                message:"User not found"

            });

        }


        // Only update contact information

        user.email = email || user.email;

        user.phone = phone || user.phone;


        await user.save();



        res.json({

            message:"Profile updated successfully",

            user:{

                id:user._id,

                firstName:user.firstName,

                lastName:user.lastName,

                email:user.email,

                phone:user.phone,

                role:user.role

            }

        });


    }
    catch(err){

        console.error(
            "Update profile error:",
            err
        );


        if(err.code === 11000){

            return res.status(400).json({

                message:"Email already exists"

            });

        }


        res.status(500).json({

            message:"Failed to update profile"

        });

    }

};





// ===============================
// GET PENDING USERS
// ADMIN ONLY
// ===============================
const getPendingUsers = async (req,res)=>{

    try {


        const users = await User.find({

            status:"pending",

            role:"user"

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
// ADMIN ONLY
// ===============================
const approveUser = async(req,res)=>{

    try {


        const user = await User.findById(
            req.params.id
        );


        if(!user){

            return res.status(404).json({

                message:"User not found"

            });

        }



        user.status = "approved";

        user.approvedAt = new Date();

        user.rejectedAt = null;

        user.rejectedReason = "";



        await user.save();



        res.json({

            message:"User approved successfully",

            user:{

                id:user._id,

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
// REJECT USER
// ADMIN ONLY
// ===============================
const rejectUser = async(req,res)=>{

    try {


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



        user.status = "rejected";

        user.rejectedAt = new Date();

        user.rejectedReason = reason || 
        "Account rejected by administrator";

        user.approvedAt = null;



        await user.save();



        res.json({

            message:"User rejected successfully",

            user:{

                id:user._id,

                status:user.status

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

    getProfile,

    updateProfile,

    getPendingUsers,

    approveUser,

    rejectUser

};