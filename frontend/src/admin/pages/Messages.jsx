import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "../styles/Messages.css";
import ConversationList from "../components/messages/ConversationList";
import socket from "../../socket/socket";
import { useToast } from "../../context/ToastContext";

import {
  formatCategory,
  formatPriority,
  formatStatus,
  formatAssignedTo,
  formatDateTime,
} from "../../utils/formatter";

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
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [filter, setFilter] = useState("all");
  const { showToast } = useToast();

  const [typingUsers, setTypingUsers] = useState({});

  const chatEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);

  const hasOpenedNotification = useRef(false);
  
  const BACKEND_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [searchParams] = useSearchParams();

  // =========================
  // FETCH CONVERSATIONS
  // =========================
  const fetchConversations = async () => {

    try {

      const url =
        filter === "archives"
          ? "/conversations?archived=true"
          : "/conversations";


      const res = await api.get(url, {
        headers:{
          Authorization:`Bearer ${token}`
        }
      });


      console.log(
        "FETCH CONVERSATIONS:",
        res.data.conversations
      );


      setConversations(
        res.data.conversations || []
      );


    } catch(err){

      console.log(
        "CONVERSATION ERROR:",
        err
      );

    } finally {

      setLoading(false);

    }

  };

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "auto",
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
  useEffect(() => {

    if (!token) return;

    fetchConversations();

  }, [token, filter]);

  // =========================
  // OPEN CONVERSATION FROM NOTIFICATION
  // =========================
  useEffect(() => {

    if (hasOpenedNotification.current) return;

    if (!conversations.length) return;

    const conversationId =
      searchParams.get("conversation");

    if (!conversationId) return;

    const conversation =
      conversations.find(
        (c) => c._id === conversationId
      );

    if (!conversation) return;

    hasOpenedNotification.current = true;

    setSelectedConversation(conversation);

  }, [conversations]);

  // =========================
  // ARCHIVE CONVERSATIONS
  // =========================
  const handleArchiveConversation = async (conversationId) => {

    try {

      await api.patch(
        `/conversations/${conversationId}/archive`,
        {},
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );


      setConversations((prev)=>
        prev.filter(
          (c)=>c._id !== conversationId
        )
      );


      showToast(
        "success",
        "Conversation archived successfully"
      );


    } catch(err){

      console.error(err);

      showToast(
        "error",
        "Failed to archive conversation"
      );

    }

  };

  // =========================
  // UNARCHIVE CONVERSATIONS
  // =========================
  const handleRestoreConversation = async (conversationId)=>{

    try{

      await api.patch(
        `/conversations/${conversationId}/unarchive`,
        {},
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );


      setConversations((prev)=>
        prev.filter(
          (c)=>c._id !== conversationId
        )
      );


      showToast(
        "success",
        "Conversation restored successfully"
      );


    }catch(err){

      console.error(err);

      showToast(
        "error",
        "Failed to restore conversation"
      );

    }

  };

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

    setTicket(res.data.ticket || null);

    setRequester(res.data.requester || null);

    // Remove unread dot immediately
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation._id !== selectedConversation._id) {
          return conversation;
        }

        return {
          ...conversation,
          adminUnread: false,
        };
      })
    );

    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation._id !== selectedConversation._id) {
          return conversation;
        }

        return {
          ...conversation,
          adminUnread: false,
          userUnread: false,
        };
      })
    );

      } catch (err) {
        console.log("MESSAGE ERROR:", err);
      }
    };

    fetchMessages();
  }, [selectedConversation?._id, token]);

  
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

        const exists = prev.some(
          (m) => m._id === normalized._id
        );

        if (exists) return prev;

        return [...prev, normalized];

      });

    };


    // 🔥 NEW TICKET CREATED
    const handleNewTicket = () => {

      console.log("🔥 NEW TICKET RECEIVED");

      fetchConversations();

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


    const handleConversationUpdated = (data) => {

      setConversations((prev) => {

        const updated = prev.map((conversation) => {

          if(
            conversation._id !== data.conversationId
          ){
            return conversation;
          }


          return {
              ...conversation,
              lastMessage:data.lastMessage,
              updatedAt:data.updatedAt,
              adminUnread:data.adminUnread,
              userUnread:data.userUnread
          };

        });


        return updated.sort(
          (a,b)=>
            new Date(b.updatedAt) -
            new Date(a.updatedAt)
        );

      });

    };


    socket.on(
      "receiveMessage",
      handleReceiveMessage
    );


    socket.on(
      "newTicket",
      handleNewTicket
    );


    socket.on(
      "typing",
      handleTyping
    );


    socket.on(
      "stopTyping",
      handleStopTyping
    );


    socket.on(
      "conversationUpdated",
      handleConversationUpdated
    );


    return () => {

      socket.off(
        "receiveMessage",
        handleReceiveMessage
      );


      socket.off(
        "newTicket",
        handleNewTicket
      );


      socket.off(
        "typing",
        handleTyping
      );


      socket.off(
        "stopTyping",
        handleStopTyping
      );


      socket.off(
        "conversationUpdated",
        handleConversationUpdated
      );

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

    // Prevent flickering when hovering child elements
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: attachment.mimetype,
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = attachment.originalname;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.log("DOWNLOAD ERROR:", err);
    }
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
  // FILE TYPE ICON
  // =========================
  const getFileIcon = (filename = "") => {
    const extension = filename.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return "fa-file-pdf";

      case "doc":
      case "docx":
        return "fa-file-word";

      case "xls":
      case "xlsx":
      case "csv":
        return "fa-file-excel";

      case "ppt":
      case "pptx":
        return "fa-file-powerpoint";

      case "zip":
      case "rar":
      case "7z":
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
  const isImageFile = (filename = "") => {
    const extension = filename.split(".").pop()?.toLowerCase();

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
          onArchive={handleArchiveConversation}
          onUnarchive={handleRestoreConversation}
          loading={loading}
          filter={filter}
          setFilter={setFilter}
      />

      {/* RIGHT */}
      <div
        className="messages-chat"
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
                      <span>{ticket?.ticketId || "------"}</span>
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
                          {formatDateTime(ticket?.createdAt)}
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
                    <div className="message-attachment-card">

                      {isImageFile(msg.attachment.originalname) && (
                      <img
                          className="attachment-preview"
                          src={`${BACKEND_URL}${msg.attachment.url}`}
                          alt={msg.attachment.originalname}
                          onClick={() =>
                              setPreviewImage({
                                  ...msg.attachment,
                                  url: `${BACKEND_URL}${msg.attachment.url}`,
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
                          onClick={() => downloadAttachment(msg.attachment)}
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
            disabled={
              ticket?.deletedByUser === true ||
              selectedConversation?.status === "closed"
            }

            onChange={handleInputChange}

            onKeyDown={(e)=>{
              if(e.key === "Enter" && !sending){
                sendMessage();
              }
            }}
            placeholder={
              ticket?.deletedByUser === true ||
              selectedConversation?.status === "closed"
              ?
              "Conversation closed"
              :
              "Type a message..."
            }
            />

              <input
                ref={fileInputRef}
                type="file"
                id="messageFile"
                hidden
                accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />

              <button
              onClick={sendMessage}
              disabled={
              sending ||
              selectedConversation?.status === "closed"
              }
              >
                {sending ? "Sending..." : "Send"}
              </button>

            </div>
          </>

        ) : (
            <div className="empty-chat">
                <i className="fa-regular fa-comments"></i>
                <h3>Select a conversation</h3>
                <p>Choose a ticket from the sidebar to start messaging.</p>
            </div>
        )}

      </div>
    </div>
  );
}