const Conversation = require("../models/Conversation");

// ===============================
// 📥 GET ALL CONVERSATIONS
// ===============================
const getConversations = async (req, res) => {
  try {
    const userId = req.user?.id;

    console.log("======================");
    console.log("GET CONVERSATIONS");
    console.log("USER ID:", userId);
    console.log("ROLE:", req.user.role);
    console.log("QUERY:", req.query);
    console.log("======================");

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    let query = {};

    // STAFF
    if (
    [
    "admin",
    "technician",
    "support",
    "it_support"
    ].includes(req.user.role)
    ) {


      // ADMIN sees everything
      if(req.user.role === "admin"){

        if(req.query.archived === "true"){

          query = {
            archivedBy:userId
          };

        }else{

          query = {
            archivedBy:{
              $ne:userId
            }
          };

        }

      }


      // STAFF sees assigned tickets only
      else {


        if(req.query.archived === "true"){

          query = {
            archivedBy:userId
          };

        }else{

          query = {
            archivedBy:{
              $ne:userId
            }
          };

        }


      }

    } else {

    // USER
    if (req.query.archived === "true") {

        query = {
          "participants.userId": userId,
          archivedBy: userId,
        };

      } else {

        query = {
          "participants.userId": userId,
          archivedBy: {
            $ne: userId,
          },
        };

      }

    }

  let conversations = await Conversation.find(query)
    .sort({ updatedAt:-1 })
    .populate({
      path: "ticketId",
      select:
        "_id ticketId title status priority category assignedTo",
      populate: {
        path: "assignedTo",
        select: "_id firstName lastName role"
      }
    })
    .populate(
      "participants.userId",
      "firstName lastName email"
    )
    .lean();

    if(
    [
    "technician",
    "support",
    "it_support"
    ].includes(req.user.role)
    ){

    conversations = conversations.filter(
      (conversation)=>{

        return (
          conversation.ticketId?.assignedTo?._id?.toString()
          === userId.toString()
        );

      }
    );

    }

    const formattedConversations = conversations.map((conversation) => {
      const requesterParticipant = conversation.participants.find(
        (p) => p.role === "user"
      );

    return {
      ...conversation,

      requester: requesterParticipant?.userId || null,

      isUnread:
        conversation.unreadBy?.some(
          id => id.toString() === userId.toString()
        ),

      isArchived: conversation.archivedBy?.some(
        id => id.toString() === userId
      ),
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


    const userId = req.user.id;

    if (
      !conversation.archivedBy.some(
        id => id.toString() === userId
      )
    ) {
      conversation.archivedBy.push(userId);
    }


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

    const userId = req.user.id;

    conversation.archivedBy =
      conversation.archivedBy.filter(
        id => id.toString() !== userId
      );

    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === req.user.id
    );


    if (
      !isParticipant &&
      ![
        "admin",
        "technician",
        "support",
        "it_support",
      ].includes(req.user.role)
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

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