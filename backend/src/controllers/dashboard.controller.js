const Conversation = require("../models/Conversation");
const Ticket = require("../models/Ticket");
const User = require("../models/User");


  // ===============================
  // 📊 GET SIDEBAR COUNTS
  // ===============================
  const getSidebarCounts = async (req, res) => {

    try {

      // ===============================
      // 💬 MESSAGE COUNT
      // ===============================
      const messageCount =
        await Conversation.countDocuments({
          adminUnread: true,
        });


      // ===============================
      // 🎫 TICKET COUNT
      // ===============================
      const ticketCount =
        await Ticket.countDocuments({
          status: {
            $ne: "resolved",
          },
        });


      // ===============================
      // 👤 ACCESS REQUEST COUNT
      // ===============================
      const accessRequestCount =
        await User.countDocuments({

          role: "user",

          status: "pending",

        });


      return res.json({

        ticketCount,

        messageCount,

        accessRequestCount,

      });


    } catch(err){

      console.log(
        "SIDEBAR COUNT ERROR:",
        err
      );


      return res.status(500).json({
        message: err.message,
      });

    }

  };

    // ===============================
    // 📩 GET USER MESSAGE COUNT
    // ===============================
    const getUserMessageCount = async (req, res) => {

    try {

        const messageCount =
        await Conversation.countDocuments({

            participants: {
            $elemMatch: {
                userId: req.user.id
            }
            },

            userUnread: true

        });


        return res.json({

        messageCount

        });


    } catch(err){

        console.log(
        "USER MESSAGE COUNT ERROR:",
        err
        );


        return res.status(500).json({
        message: err.message,
        });

    }

    };

    // ===============================
    // 👥 GET STAFF RECENT USERS
    // ===============================
    const getStaffRecentUsers = async (req,res)=>{

      try{

        const users = await User.find({
          role:"user"
        })
        .select(
          "firstName lastName email createdAt status role"
        )
        .sort({
          createdAt:-1
        })
        .limit(5);


        return res.json({

          users

        });


      }catch(err){

        console.log(
          "STAFF RECENT USERS ERROR:",
          err
        );


        return res.status(500).json({
          message:err.message
        });

      }

    };
    
module.exports = {
  getSidebarCounts,
  getUserMessageCount,
  getStaffRecentUsers
};