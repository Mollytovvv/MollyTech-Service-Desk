import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Messages.css";
import ConversationList from "../components/messages/ConversationList";
import socket from "../socket/socket";
import { formatCategory, formatPriority, formatStatus, formatAssignedTo, } from "../utils/formatter";

export default function Messages() {
  const { token, user } = useAuth();
  console.log("AUTH USER:", user);

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [requester, setRequester] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [typingUsers, setTypingUsers] = useState({});

  const chatEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);
  const BACKEND_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // =========================
  // SOCKET REGISTER
  // =========================
  useEffect(() => {
    if (!user?._id) return;

    socket.connect();
    socket.emit("register", user._id);
  }, [user]);

  // =========================
  // FETCH CONVERSATIONS
  // =========================
  useEffect(() => {
    if (!token) return;

    const fetchConversations = async () => {
      try {
        const res = await api.get("/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setConversations(res.data.conversations || []);
      } catch (err) {
        console.log("CONVERSATION ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token]);

  // =========================
  // FETCH MESSAGES
  // =========================
  useEffect(() => {
    if (!selectedConversation?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(
          `/messages/${selectedConversation._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

    console.log("FULL RESPONSE:", res.data);

    const normalized = (res.data.messages || []).map((m) => ({
      ...m,
      senderId: m.sender?._id || m.sender,
      senderRole: m.senderRole || m.sender?.role,
    }));

    setMessages(normalized);

    // NEW
    setTicket(res.data.ticket || null);
    setRequester(res.data.requester || null);
      } catch (err) {
        console.log("MESSAGE ERROR:", err);
      }
    };

    fetchMessages();
  }, [selectedConversation, token]);

  // =========================
  // 🔥 ADD THIS RIGHT BELOW
  // =========================
  useEffect(() => {
    if (!selectedConversation?._id) return;

    socket.emit("joinConversation", selectedConversation._id);

    return () => {
      socket.emit("leaveConversation", selectedConversation._id);
    };
  }, [selectedConversation?._id]);

  // =========================
  // SOCKET LISTENERS
  // =========================
  useEffect(() => {
    const handleReceiveMessage = (message) => {
    const normalized = {
      ...message,
      senderId: message.sender?._id || message.sender,
      senderRole: message.senderRole || message.sender?.role,
    };

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === normalized._id);
        if (exists) return prev;
        return [...prev, normalized];
      });
    };

    const handleTyping = ({ conversationId, userId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: userId,
      }));
    };

    const handleStopTyping = ({ conversationId }) => {
      setTypingUsers((prev) => {
        const copy = { ...prev };
        delete copy[conversationId];
        return copy;
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, []);

  // =========================
  // TYPING EMITTER
  // =========================
  const handleInputChange = (e) => {
    setInput(e.target.value);

    // 🛑 SAFETY CHECKS (IMPORTANT)
    if (!selectedConversation?._id) return;
    if (!user?._id) return;

    socket.emit("typing", {
      conversationId: selectedConversation._id,
      userId: user._id,
    });

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", {
        conversationId: selectedConversation._id,
        userId: user._id,
      });
    }, 1000);
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || !selectedConversation) return;

    try {
      setSending(true);

      const formData = new FormData();

      formData.append(
        "conversationId",
        selectedConversation._id
      );

      formData.append(
        "text",
        input
      );

      if (selectedFile) {
        formData.append(
          "attachment",
          selectedFile
        );
      }

      const res = await api.post(
        "/messages",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const savedMessage = {
        ...res.data.data,
        senderId: res.data.data.sender,
        senderRole: user.role,
      };

      socket.emit("sendMessage", {
        conversationId: selectedConversation._id,
        message: savedMessage,
      });

      setInput("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {
      console.log("SEND ERROR:", err);
    } finally {
      setSending(false);
    }
  };

  // =========================
  // FIXED ALIGNMENT LOGIC
  // =========================
  const isStaffMessage = (msg) => {
    const role = msg.senderRole?.toLowerCase();

    return (
      role === "admin" ||
      role === "it_support" ||
      role === "technician"
    );
  };

  return (
    <div className="messages-page">

      {/* LEFT */}
      <ConversationList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelect={setSelectedConversation}
        loading={loading}
      />

      {/* RIGHT */}
      <div className="messages-chat">

        {selectedConversation ? (
          <>
            {/* HEADER */}
            <div className="chat-header">

            {ticket && (
              <>
                <div className="chat-header-top">

                  <div className="chat-title-group">

                    <h2 className="chat-ticket-title">
                      {ticket.title}
                    </h2>

                  </div>

                  <span className={`ticket-status ${ticket.status}`}>
                    {formatStatus(ticket.status)}
                  </span>

                </div>

                <div className="messages-meta-grid">

                  <div className="messages-meta-item">
                    <i className="fa-solid fa-hashtag"></i>

                    <div className="messages-meta-content">
                      <small>Ticket ID:</small>
                      <span>#{ticket?._id?.slice(-6) || "------"}</span>
                    </div>
                  </div>

                  <div className="messages-meta-item">
                    <i className="fa-solid fa-user"></i>

                    <div className="messages-meta-content">
                      <small>Requester:</small>
                      <span>
                        {requester?.firstName} {requester?.lastName}
                      </span>
                    </div>
                  </div>

                  <div className="messages-meta-item">
                    <i className="fa-solid fa-envelope"></i>

                    <div className="messages-meta-content">
                      <small>Email:</small>
                      <span>{ticket?.email || "N/A"}</span>
                    </div>
                  </div>

                  <div className="messages-meta-item">
                    <i className="fa-solid fa-phone"></i>

                    <div className="messages-meta-content">
                      <small>Phone:</small>
                      <span>{ticket?.phoneNumber || "N/A"}</span>
                    </div>
                  </div>

                  <div className="messages-meta-item">
                    <i className="fa-solid fa-layer-group"></i>

                    <div className="messages-meta-content">
                      <small>Category:</small>
                      <span>{formatCategory(ticket.category)}</span>
                    </div>
                  </div>

                  <div className="messages-meta-item">
                    <i className="fa-solid fa-bolt"></i>

                    <div className="messages-meta-content">
                      <small>Priority:</small>

                      <span className={`priority ${ticket.priority}`}>
                        {formatPriority(ticket.priority)}
                      </span>
                    </div>
                  </div>

                  <div className="messages-meta-item">
                    <i className="fa-solid fa-user-gear"></i>

                    <div className="messages-meta-content">
                      <small>Assigned:</small>
                      <span>{formatAssignedTo(ticket.assignedTo)}</span>
                    </div>
                  </div>

                  <div className="messages-meta-item">
                    <i className="fa-solid fa-calendar-days"></i>

                    <div className="messages-meta-content">
                      <small>Created:</small>

                      <span>
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                </div>
              </>
            )}

            </div>

            {/* CHAT BODY */}
            <div className="chat-body">

              {messages.length > 0 ? (
                messages.map((msg, i) => {

                console.log("MESSAGE:", {
                  text: msg.text,
                  sender: msg.sender,
                  senderRole: msg.senderRole,
                  isStaff: isStaffMessage(msg),
                });

                  return (
                    <div
                      key={msg._id || i}
                      className={`message-bubble ${
                        isStaffMessage(msg)
                          ? "admin-msg"
                          : "user-msg"
                      }`}
                    >
                    {msg.text && <p>{msg.text}</p>}

                    {msg.attachment && (
                      <a
                          className="message-attachment"
                          href={`${BACKEND_URL}${msg.attachment.url}`}
                          target="_blank"
                          rel="noreferrer"
                      >
                          📎 {msg.attachment.originalname}
                      </a>
                    )}

                      <small>
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleString()
                          : ""}
                      </small>
                    </div>
                  );
                })
              ) : (
                <p className="muted">No messages yet</p>
              )}

              {/* TYPING */}
              {typingUsers[selectedConversation?._id] && (
                <div className="typing-indicator">
                  Someone is typing...
                </div>
              )}

              <div ref={chatEndRef} />

            </div>

            {/* INPUT */}
            {selectedFile && (
              <div className="selected-file">
                <div className="selected-file-left">
                  <i className="fa-solid fa-file"></i>

                  <div>
                    <strong>{selectedFile.name}</strong>

                    <small>
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}
          
            <div className="chat-input">

            <label
              htmlFor="messageFile"
              className="attach-btn"
              title="Attach a file"
            >
              <i className="fa-solid fa-paperclip"></i>
            </label>

              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <input
                ref={fileInputRef}
                type="file"
                id="messageFile"
                hidden
                accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />

              <button onClick={sendMessage} disabled={sending}>
                {sending ? "Sending..." : "Send"}
              </button>

            </div>
          </>

        ) : (
          <div className="empty-chat">
            Select a conversation to start chatting
          </div>
        )}

      </div>
    </div>
  );
}