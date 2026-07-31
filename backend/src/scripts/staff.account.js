const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");


const createStaffAccounts = async () => {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");


        const staffAccounts = [

            {
                firstName:"MollyTech",
                lastName:"Support",
                email:"mollytech.support@gmail.com",
                phone:"09170000001",
                password:"Support@123",
                role:"support",
                status:"approved"
            },

            {
                firstName:"MollyTech",
                lastName:"Technician",
                email:"mollytech.technician@gmail.com",
                phone:"09170000002",
                password:"Technician@123",
                role:"technician",
                status:"approved"
            }

        ];


        for(const account of staffAccounts){


            const existing =
                await User.findOne({
                    email:account.email
                });


            if(existing){

                console.log(
                    `${account.email} already exists`
                );

                continue;

            }


            const hashedPassword =
                await bcrypt.hash(
                    account.password,
                    10
                );


            await User.create({

                firstName:account.firstName,

                lastName:account.lastName,

                email:account.email,

                phone:account.phone,

                password:hashedPassword,

                role:account.role,

                status:account.status

            });


            console.log(
                `Created ${account.email}`
            );

        }


        console.log(
            "Staff accounts setup complete"
        );


        process.exit();


    } catch(err){

        console.log(
            "SEED ERROR:",
            err
        );

        process.exit(1);

    }

};


createStaffAccounts();