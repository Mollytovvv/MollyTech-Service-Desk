// ===============================
// 📌 AUTH CONTROLLER
// ===============================

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Notification = require("../models/Notification");


// ===============================
// 🧾 REGISTER USER
// ===============================
const register = async (req,res)=>{

    console.log("REGISTER BODY:", req.body);

    try{

        const {
            firstName,
            lastName,
            email,
            phone,
            password,
        } = req.body;



        if(
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !password
        ){

            return res.status(400).json({

                message:"All fields are required"

            });

        }



        const existingUser = await User.findOne({
            email
        });



        if(existingUser){

            return res.status(400).json({

                message:"Email already exists"

            });

        }



        const hashedPassword = await bcrypt.hash(
            password,
            10
        );



        const user = await User.create({

            firstName,

            lastName,

            email,

            phone,

            password:hashedPassword,

            role:"user",

            status:"pending"

        });

        // ===============================
        // CREATE ACCESS REQUEST NOTIFICATION
        // ===============================

        const admin = await User.findOne({
            role:"admin"
        });


        if(admin){

            const notification =
                await Notification.create({

                    recipient: admin._id,

                    sender: user._id,

                    type:"access_request",

                    title:"New Access Request",

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


        const io = req.app.get("io");


        if(io){

            io.to(admin._id.toString())
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

        const io = req.app.get("io");

        console.log(
            "SOCKET IO:",
            !!io
        );


        if(io){

            io.to("admins").emit(
                "newAccessRequest",
                {
                    userId:user._id,
                    firstName:user.firstName,
                    lastName:user.lastName,
                    email:user.email
                }
            );

            io.to("admins").emit("accessRequestUpdated");
            
            io.emit("newUser", {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt
            });

            console.log(
                "New access request emitted:",
                user.email
            );

        }



        // ===============================
        // SEND RESPONSE TO FRONTEND
        // ===============================

        res.status(201).json({

            message:
            "Registration submitted. Waiting for administrator approval."

        });



    }catch(err){

        console.error(
            "REGISTER ERROR:",
            err
        );


        res.status(500).json({

            message:err.message

        });

    }

};


// ===============================
// 🔐 LOGIN USER
// ===============================
const login = async(req,res)=>{

    try{


        const {
            email,
            password
        } = req.body;



        const user = await User.findOne({
            email
        });



        if(!user){

            return res.status(404).json({
                message:"User not found"
            });

        }

        // ===============================
        // ACCOUNT APPROVAL CHECK
        // ===============================

        if(
            user.role === "user" &&
            user.status !== "approved"
        ){

            return res.status(403).json({

                message:
                user.status === "rejected"

                ?

                "Your account registration was declined."

                :

                "Your account is still waiting for administrator approval."

            });

        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );



        if(!isMatch){

            return res.status(401).json({
                message:"Invalid email or password"
            });

        }



        const token = jwt.sign(

            {
                id:user._id,

                firstName:user.firstName || "",

                lastName:user.lastName || "",

                email:user.email,

                role:user.role,

                status:user.status
            },

            process.env.JWT_SECRET,

            {
                expiresIn:"1d"
            }

        );



        res.json({

            message:"Login successful",

            token,

            user:{
                _id:user._id,

                firstName:user.firstName || "",

                lastName:user.lastName || "",

                email:user.email,

                phone:user.phone || "",

                role:user.role,

                status:user.status

            }

        });


    }catch(err){

        res.status(500).json({
            message:err.message
        });

    }

};



// ===============================
// 🔑 CHANGE PASSWORD
// ===============================
const changePassword = async(req,res)=>{

    try{


        const {
            currentPassword,
            newPassword,
            confirmPassword

        } = req.body;



        if(
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ){

            return res.status(400).json({

                message:"All fields are required"

            });

        }



        if(newPassword !== confirmPassword){

            return res.status(400).json({

                message:"New passwords do not match"

            });

        }



        const user = await User.findById(
            req.user.id
        );



        if(!user){

            return res.status(404).json({

                message:"User not found"

            });

        }



        const isMatch = await bcrypt.compare(

            currentPassword,
            user.password

        );



        if(!isMatch){

            return res.status(401).json({

                message:"Current password is incorrect"

            });

        }

        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (isSamePassword) {

            return res.status(400).json({

                message:
                    "New password must be different from your current password"

            });

        }

        if (newPassword.length < 8) {

            return res.status(400).json({

                message:
                    "Password must be at least 8 characters"

            });

        }

        user.password = await bcrypt.hash(
            newPassword,
            10
        );


        await user.save();



        res.json({

            message:"Password updated successfully"

        });



    }catch(err){

        res.status(500).json({

            message:err.message

        });

    }

};



// ===============================
// 👥 GET ALL USERS
// ===============================
const getUsers = async(req,res)=>{

    try{


        const users = await User.find()

        .select("-password")

        .sort({
            createdAt:-1
        });



        res.json({

            count:users.length,
            users

        });


    }catch(err){

        res.status(500).json({

            message:err.message

        });

    }

};



// ===============================
// EXPORTS
// ===============================
module.exports = {

    register,
    login,
    changePassword,
    getUsers

};