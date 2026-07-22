// ===============================
// 📌 AUTH CONTROLLER
// ===============================

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


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
          password,
        } = req.body;

        if (
          !firstName ||
          !lastName ||
          !email ||
          !password
        ) {
          return res.status(400).json({
            message: "All fields are required",
          });
        }


        const existingUser = await User.findOne({email});


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
          password: hashedPassword,
          role: "user",
        });


        res.status(201).json({

            message:"User registered successfully",
            user

        });


    }catch(err){

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
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                role:user.role
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
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                role:user.role

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