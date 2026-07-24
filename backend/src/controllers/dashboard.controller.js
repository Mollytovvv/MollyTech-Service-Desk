const Conversation = require("../models/Conversation");
const Ticket = require("../models/Ticket");


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


    return res.json({

      ticketCount,

      messageCount,

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

module.exports = {
  getSidebarCounts,
  getUserMessageCount,
};