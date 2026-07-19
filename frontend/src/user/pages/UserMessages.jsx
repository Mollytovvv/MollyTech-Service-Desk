import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import UserConversationList from "../components/messages/UserConversationList";
import socket from "../../socket/socket";

import {
  formatCategory,
  formatPriority,
  formatStatus,
  formatAssignedTo,
  formatDateTime,
} from "../../utils/formatter";

import "../styles/UserMessages.css";

export default function UserMessages() {
  const { token, user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [archivedConversations, setArchivedConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [ticket, setTicket] = useState(null);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

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
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

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

  const fetchConversations = async () => {
  console.log("FETCHING USER CONVERSATIONS...");
    try {
      const [activeRes, archivedRes] = await Promise.all([
        api.get("/conversations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        api.get("/conversations?archived=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

console.log(activeRes.data);
console.log(archivedRes.data);

      setConversations(activeRes.data.conversations || []);
      setArchivedConversations(
        archivedRes.data.conversations || []
      );

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD CONVERSATIONS
  // =========================

  useEffect(() => {
    if (!token) return;

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
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

console.log("USER CONVERSATIONS RESPONSE:", res.data);

        console.log("USER MESSAGE RESPONSE:", res.data);

        const normalized = (res.data.messages || []).map((m) => ({
          ...m,
          senderId: m.sender?._id || m.sender,
          senderRole: m.senderRole || m.sender?.role,
        }));

        setMessages(normalized);
        setTicket(res.data.ticket || null);
      } catch (err) {
        console.log("USER MESSAGE ERROR:", err);
      }
    };

    fetchMessages();
  }, [selectedConversation, token]);

  // =========================
  // JOIN ROOM
  // =========================

  useEffect(() => {
    if (!selectedConversation?._id) return;

    socket.emit("joinConversation", selectedConversation._id);

    return () => {
      socket.emit("leaveConversation", selectedConversation._id);
    };
  }, [selectedConversation]);

  // =========================
  // SOCKET LISTENERS
  // =========================

  useEffect(() => {
  const handleReceiveMessage = (message) => {

    const normalized = {
      ...message,
      senderId: message.sender?._id || message.sender,
      senderRole:
        message.senderRole ||
        message.sender?.role,
    };


    setMessages((prev) => {

      if (
        prev.some(
          (m)=>m._id === normalized._id
        )
      ){
        return prev;
      }


      return [
        ...prev,
        normalized
      ];

    });


    setConversations((prev)=>
      prev.map((c)=>
        c._id === normalized.conversationId
        ?
        {
          ...c,
          lastMessage:
            normalized.text ||
            "Attachment",
          updatedAt:
            normalized.createdAt
        }
        :
        c
      )
    );

  };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("ticketUpdated", handleTicketUpdated);

    socket.on("typing", ({ conversationId, userId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: userId,
      }));
    });

    socket.on("stopTyping", ({ conversationId }) => {
      setTypingUsers((prev) => {
        const copy = { ...prev };
        delete copy[conversationId];
        return copy;
      });
    });

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("ticketUpdated", handleTicketUpdated);
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, []);

  // =========================
  // TICKET UPDATED
  // =========================

  const handleTicketUpdated = (updatedTicket) => {

    // Update conversation list
    setConversations((prev) =>
      prev.map((conversation) => {

        if (
          conversation.ticketId?._id !== updatedTicket._id
        ) {
          return conversation;
        }

        return {
          ...conversation,
          ticketId: {
            ...conversation.ticketId,
            ...updatedTicket,
          },
        };

      })
    );

    // Update currently opened ticket
    setTicket((prev) => {

      if (!prev || prev._id !== updatedTicket._id) {
        return prev;
      }

      return {
        ...prev,
        ...updatedTicket,
      };

    });

  };

  // =========================
  // TYPING
  // =========================

  const handleInput = (e) => {
    setInput(e.target.value);

    if (!selectedConversation) return;

    socket.emit("typing", {
      conversationId: selectedConversation._id,
      userId: user._id,
    });

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", {
        conversationId: selectedConversation._id,
      });
    }, 1000);
  };

  // =========================
  // DRAG & DROP
  // =========================

  const handleDragEnter = (e) => {
    if (!selectedConversation) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    if (!selectedConversation) return;

    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      e.relatedTarget &&
      e.currentTarget.contains(e.relatedTarget)
    ) {
      return;
    }

    setIsDragging(false);
  };

  const handleDrop = (e) => {
    if (!selectedConversation) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);

    const files = e.dataTransfer.files;

    if (!files || files.length === 0) return;

    const file = files[0];

    setSelectedFile(file);

    if (fileInputRef.current) {
      fileInputRef.current.files = files;
    }
  };

  // =========================
  // DOWNLOAD ATTACHMENT
  // =========================

  const downloadAttachment = async (attachment) => {
    try {

      const response = await api.get(
        `/messages/download/${attachment.filename}`,
        {
          headers:{
            Authorization:`Bearer ${token}`,
          },
          responseType:"blob",
        }
      );


      const blob = new Blob(
        [response.data],
        {
          type:attachment.mimetype,
        }
      );


      const url = window.URL.createObjectURL(blob);


      const link = document.createElement("a");

      link.href = url;

      link.download = attachment.originalname;


      document.body.appendChild(link);

      link.click();

      link.remove();


      window.URL.revokeObjectURL(url);


    } catch(err){

      console.log(
        "DOWNLOAD ERROR:",
        err
      );

    }
  };

  // =========================
  // FILE TYPE ICON
  // =========================

  const getFileIcon = (filename="") => {

    const extension =
      filename.split(".").pop()?.toLowerCase();


    switch(extension){

      case "pdf":
        return "fa-file-pdf";

      case "doc":
      case "docx":
        return "fa-file-word";

      case "xls":
      case "xlsx":
        return "fa-file-excel";

      case "ppt":
      case "pptx":
        return "fa-file-powerpoint";

      case "zip":
      case "rar":
        return "fa-file-zipper";

      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
        return "fa-file-image";

      case "txt":
        return "fa-file-lines";

      default:
        return "fa-file";
    }

  };

  // =========================
  // IMAGE CHECKER
  // =========================

  const isImageFile = (filename="") => {

    const extension =
      filename.split(".").pop()?.toLowerCase();


    return [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "bmp",
      "svg",
    ].includes(extension);

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
        senderId:
          res.data.data.sender?._id ||
          res.data.data.sender,

        senderRole:
          user.role,
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

  const isStaffMessage = (msg) => {
    const role = msg.senderRole?.toLowerCase();

    return (
      role === "admin" ||
      role === "it_support" ||
      role === "technician"
    );
  };

const handleArchiveConversation = async (conversationId) => {
  try {
    await api.patch(
      `/conversations/${conversationId}/archive`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setConversations((prev) =>
      prev.map((c) =>
        c._id === conversationId
          ? { ...c, isArchived: true }
          : c
      )
    );

    if (selectedConversation?._id === conversationId) {
      setSelectedConversation(null);
    }
  } catch (err) {
    console.log(err);
  }
};

  const handleUnarchiveConversation = async (conversationId) => {
    try {
      await api.patch(
        `/conversations/${conversationId}/unarchive`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? { ...c, isArchived: false }
            : c
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="user-messages-page">
    <UserConversationList
        conversations={conversations}
        archivedConversations={archivedConversations}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
        onArchive={handleArchiveConversation}
        onUnarchive={handleUnarchiveConversation}
      />

    <div
      className="user-chat"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >

    {isDragging && (
      <div className="drag-overlay">

        <div className="drag-overlay-content">

          <i className="fa-solid fa-cloud-arrow-up"></i>

          <h2>Drop file to upload</h2>

          <p>
            Release your mouse to attach the file
          </p>

        </div>

      </div>
    )}

    {previewImage && (
      <div
        className="image-preview-overlay"
        onClick={() => setPreviewImage(null)}
      >
        <div
          className="image-preview-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="image-preview-actions">

            <button
              className="image-preview-download"
              onClick={() => downloadAttachment(previewImage)}
            >
              <i className="fa-solid fa-download"></i>
            </button>

            <button
              className="image-preview-close"
              onClick={() => setPreviewImage(null)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

          </div>

          <img
            src={previewImage.url}
            alt={previewImage.name}
          />

        </div>
      </div>
    )}

        {selectedConversation ? (
          <>
            <div className="user-chat-header">

                    <div className="user-chat-title">

                        <h2>
                            {ticket?.title || "Untitled Ticket"}
                        </h2>

                    </div>

                    <span
                        className={`ticket-status ${ticket?.status || ""}`}
                    >
                        {formatStatus(ticket?.status)}
                    </span>

                </div>

              <div className="user-ticket-meta">

                  <div className="meta-card">

                      <i className="fa-solid fa-hashtag"></i>

                      <div className="meta-content">

                          <small>
                              Ticket ID
                          </small>

                          <span>
                              {ticket?.ticketId || "N/A"}
                          </span>

                      </div>

                  </div>

              <div className="meta-card">

                  <i className="fa-solid fa-layer-group"></i>

                  <div className="meta-content">

                      <small>
                          Category
                      </small>

                      <span>
                          {ticket?.category
                            ? formatCategory(ticket.category)
                            : "N/A"}
                      </span>

                  </div>

              </div>

              <div className="meta-card">

                  <i className="fa-solid fa-flag"></i>

                  <div className="meta-content">

                      <small>
                          Priority
                      </small>

                      <span className={`priority ${ticket?.priority}`}>
                          {ticket?.priority
                            ? formatPriority(ticket.priority)
                            : "N/A"}
                      </span>

                  </div>

              </div>

              <div className="meta-card">

                  <i className="fa-solid fa-user-gear"></i>

                  <div className="meta-content">

                      <small>
                          Assigned To
                      </small>

                      <span>
                          {ticket?.assignedTo
                            ? formatAssignedTo(ticket.assignedTo)
                            : "Awaiting Support"}
                      </span>

                  </div>

              </div>

              <div className="meta-card">

                  <i className="fa-solid fa-calendar"></i>

                  <div className="meta-content">

                      <small>
                          Created
                      </small>

                      <span>
                          {formatDateTime(ticket?.createdAt)}
                      </span>

                  </div>

              </div>
            </div>

            <div className="user-chat-body">
              {messages.length ? (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`message-bubble ${
                    isStaffMessage(msg)
                      ? "admin-msg"
                      : "user-msg"
                  }`}
                >

                  {msg.text && (
                    <p>{msg.text}</p>
                  )}


                  {msg.attachment && (
                    <div className="message-attachment-card">


                      {isImageFile(msg.attachment.originalname) && (

                        <img
                          className="attachment-preview"

                          src={`${BACKEND_URL}${msg.attachment.url}`}

                          alt={msg.attachment.originalname}

                          onClick={() =>
                            setPreviewImage({
                              ...msg.attachment,
                              url:`${BACKEND_URL}${msg.attachment.url}`
                            })
                          }
                        />

                      )}



                      <div className="attachment-info">

                        <i
                          className={`fa-solid ${getFileIcon(
                            msg.attachment.originalname
                          )}`}
                        ></i>


                        <div className="attachment-details">

                          <strong>
                            {msg.attachment.originalname}
                          </strong>


                          <small>
                            {msg.attachment.mimetype || "File"}
                          </small>


                          <small>
                            {(msg.attachment.size / 1024).toFixed(1)} KB
                          </small>


                        </div>

                      </div>



                      <button
                        type="button"
                        className="attachment-download"

                        onClick={() =>
                          downloadAttachment(msg.attachment)
                        }
                      >

                        <i className="fa-solid fa-download"></i>

                        Download

                      </button>


                    </div>
                  )}

                  <small>
                      {formatDateTime(msg.createdAt)}
                  </small>


                </div>
              ))
              ) : (
                <p>No messages yet.</p>
              )}

              {typingUsers[selectedConversation._id] && (
                <div className="typing-indicator">
                  Support is typing...
                </div>
              )}

              <div ref={chatEndRef}></div>
            </div>

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

            <div className="user-chat-input">

            <label
              htmlFor="messageFile"
              className="attach-btn"
            >
              <i className="fa-solid fa-paperclip"></i>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              id="messageFile"
              hidden
              accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
              onChange={(e)=>{

              const file=e.target.files[0];

              if(!file) return;

              setSelectedFile(file);

              }}
            />    
          
              <input
                value={input}
                onChange={handleInput}
                placeholder="Type a message..."
                onKeyDown={(e) =>
                  e.key === "Enter" && sendMessage()
                }
              />

              <button
                onClick={sendMessage}
                disabled={sending}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </>
        ) : (
              <div className="empty-chat">

              <i className="fa-regular fa-comments"></i>

              <h3>
              Select a conversation
              </h3>

              <p>
              Choose a ticket from the sidebar to start messaging.
              </p>

              </div>
        )}
      </div>
    </div>
  );
}