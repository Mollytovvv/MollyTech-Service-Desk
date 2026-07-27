const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(

{
    // =========================
    // USER INFORMATION
    // =========================

    firstName: {

        type: String,

        required: function(){

            return (
                this.role === "user" ||
                this.role === "technician"
            );

        },

        trim:true,

    },


    lastName: {

        type: String,

        required: function(){

            return (
                this.role === "user" ||
                this.role === "technician"
            );

        },

        trim:true,

    },


    email: {

        type:String,

        required:true,

        unique:true,

        lowercase:true,

        trim:true,

    },


    phone: {

        type:String,

        default:"",

        trim:true,

    },


    password: {

        type:String,

        required:true,

    },



    // =========================
    // ACCESS CONTROL
    // =========================

    role: {

        type:String,

        enum:[

            "admin",

            "technician",

            "user"

        ],

        default:"user",

    },



    // =========================
    // ACCOUNT APPROVAL
    // =========================

    status: {

        type:String,

        enum:[

            "pending",

            "approved",

            "rejected"

        ],

        default:"pending",

    },



    approvedAt: {

        type:Date,

        default:null,

    },


    rejectedAt: {

        type:Date,

        default:null,

    },


    rejectedReason: {

        type:String,

        default:"",

        trim:true,

    },


},


{
    timestamps:true
}


);



module.exports = mongoose.model(
    "User",
    userSchema
);