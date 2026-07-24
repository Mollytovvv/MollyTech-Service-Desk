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
                message: "User not found"
            });

        }


        res.json(user);


    } catch (err) {

        console.error(
            "Get profile error:",
            err
        );


        res.status(500).json({
            message: "Failed to fetch profile"
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

module.exports = {
    getProfile,
    updateProfile
};