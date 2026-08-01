const Conversation = require("../models/Conversation");
const Ticket = require("../models/Ticket");
const User = require("../models/User");


    // ===============================
    // 📊 GET SIDEBAR COUNTS
    // ===============================
    const getSidebarCounts = async (req, res) => {

      try {

        let ticketCount = 0;
        let messageCount = 0;
        let accessRequestCount = 0;


        // ===============================
        // 🎫 TICKET COUNT BY ROLE
        // ===============================

        if (req.user.role === "admin") {

          ticketCount = await Ticket.countDocuments({
            status: {
              $ne: "resolved",
            },
            "archivedBy.admin": false,
          });

        }


        else if (
          req.user.role === "technician" ||
          req.user.role === "support"
        ) {

          ticketCount = await Ticket.countDocuments({

            assignedTo: req.user.id,

            status: {
              $ne: "resolved",
            },

            "archivedBy.admin": false,

          });

        }


        else {

          ticketCount = await Ticket.countDocuments({

            "submittedBy.userId": req.user.id,

            status: {
              $ne: "resolved",
            },

            "archivedBy.user": false,

            deletedByUser: false,

          });

        }



        // ===============================
        // 💬 MESSAGE COUNT
        // ===============================

        messageCount = await Conversation.countDocuments({
          unreadBy: req.user.id,
        });



        // ===============================
        // 👤 ACCESS REQUEST COUNT
        // ===============================

        if(req.user.role === "admin"){

          accessRequestCount =
            await User.countDocuments({

              role:"user",

              status:"pending",

            });

        }



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
          message:err.message,
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
            unreadBy: req.user.id,
          });

        return res.json({
          messageCount,
        });

      } catch (err) {

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