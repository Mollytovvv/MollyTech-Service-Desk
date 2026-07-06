const Conversation = require("../models/Conversation");

// ===============================
// 📥 GET ALL CONVERSATIONS
// ===============================
const getConversations = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let query = {};

    // ADMIN sees all conversations
    if (req.user.role === "admin") {
      query = {};
    } 
    // USER sees only their conversations
    else {
      query = {
        "participants.userId": userId,
      };
    }

  const conversations = await Conversation.find(query)
    .sort({ updatedAt: -1 })
    .populate(
      "ticketId",
      "title status priority category"
    )
    .populate(
      "participants.userId",
      "firstName lastName email"
    )
    .lean();

    console.log(
      JSON.stringify(conversations, null, 2)
    );

  const formattedConversations = conversations.map((conversation) => {
    const requesterParticipant = conversation.participants.find(
      (p) => p.role === "user"
    );

    return {
      ...conversation,
      requester: requesterParticipant?.userId || null,
    };
  });

  return res.json({
    count: formattedConversations.length,
    conversations: formattedConversations,
  });

  } catch (err) {
    console.log("GET CONVERSATIONS ERROR:", err);
    return res.status(500).json({ message: err.message });
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
      return res.status(404).json({ message: "Conversation not found" });
    }

    return res.json(conversation);

  } catch (err) {
    console.log("GET CONVERSATION ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getConversations,
  getConversationById,
};