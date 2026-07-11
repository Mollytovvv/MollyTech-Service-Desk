const Conversation = require("../models/Conversation");

// ===============================
// 📥 GET ALL CONVERSATIONS
// ===============================
const getConversations = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    let query = {};

    // ADMIN
    if (req.user.role === "admin") {

      if (req.query.archived === "true") {

        query = {
          isArchived: true
        };

      } else {

        query = {
          isArchived: {
            $ne: true
          }
        };

      }

    }

    // USER
    else {

      query = {
        "participants.userId": userId,
        isArchived: {
          $ne: true
        }
      };

    }

    const conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .populate(
        "ticketId",
        "_id ticketId title status priority category"
      )
      .populate(
        "participants.userId",
        "firstName lastName email"
      )
      .lean();

    const formattedConversations = conversations.map((conversation) => {
      const requesterParticipant = conversation.participants.find(
        (p) => p.role === "user"
      );

    return {
      ...conversation,

      requester: requesterParticipant?.userId || null,

      unread:
        req.user.role === "admin"
          ? conversation.adminUnread
          : conversation.userUnread,

      isArchived: conversation.isArchived,
    };
    });

    return res.json({
      count: formattedConversations.length,
      conversations: formattedConversations,
    });

  } catch (err) {
    console.log("GET CONVERSATIONS ERROR:", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

    // ===============================
    // 📥 GET SINGLE CONVERSATION
    // ===============================
    const getConversationById = async (req, res) => {
      try {
        const conversation = await Conversation.findById(req.params.id)
          .populate("ticketId", "title status");

        if (!conversation) {
          return res.status(404).json({
            message: "Conversation not found",
          });
        }

        return res.json(conversation);

      } catch (err) {
        console.log("GET CONVERSATION ERROR:", err);

        return res.status(500).json({
          message: err.message,
        });
      }
    };

    // ===============================
    // 📦 ARCHIVE CONVERSATION
    // ===============================

    const archiveConversation = async (req,res)=>{

    try{

    const conversation = await Conversation.findById(
        req.params.id
    );


    if(!conversation){

    return res.status(404).json({
    message:"Conversation not found"
    });

    }


    conversation.isArchived = true;


    await conversation.save();


    return res.json({
    message:"Conversation archived successfully"
    });


    }
    catch(err){

    console.log(
    "ARCHIVE ERROR:",
    err
    );


    return res.status(500).json({
    message:err.message
    });

    }


    };

    // ===============================
    // 📂 UNARCHIVE CONVERSATION
    // ===============================

    const unarchiveConversation = async (req, res) => {
      try {

        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
          return res.status(404).json({
            message: "Conversation not found",
          });
        }

        conversation.isArchived = false;

        await conversation.save();

        return res.json({
          message: "Conversation restored successfully",
        });

      } catch (err) {

        console.log("UNARCHIVE ERROR:", err);

        return res.status(500).json({
          message: err.message,
        });

      }
    };

module.exports = {
  getConversations,
  getConversationById,
  archiveConversation,
  unarchiveConversation,
};