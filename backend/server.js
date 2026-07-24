require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const connectDB = require("./src/config/db");


// ===============================
// APP + SERVER INIT
// ===============================
const app = express();
const server = http.createServer(app);

// ===============================
// SOCKET.IO SETUP
// ===============================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// attach io to express (for controllers)
app.set("io", io);

// ===============================
// ONLINE USERS STORE
// ===============================
const onlineUsers = new Map();

// ===============================
// SOCKET EVENTS
// ===============================
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

// ===============================
// 👤 REGISTER USER
// ===============================
socket.on("register", (userId) => {

  if (!userId) return;

  // Save user ID on socket
  socket.userId = userId;

  // Store online user
  onlineUsers.set(userId, socket.id);

  // Join personal notification room
  socket.join(userId);

  // Broadcast online users list
  io.emit(
    "onlineUsers",
    Array.from(onlineUsers.keys())
  );

  console.log("👤 Registered user:", userId);

});

  // ===============================
  // JOIN CONVERSATION ROOM
  // ===============================
  socket.on("joinConversation", (conversationId) => {
    if (!conversationId) return;

    socket.join(conversationId);
    socket.activeConversation = conversationId;

    console.log(`💬 Joined room: ${conversationId}`);
  });

  // ===============================
  // LEAVE CONVERSATION ROOM
  // ===============================
  socket.on("leaveConversation", (conversationId) => {
    if (!conversationId) return;

    socket.leave(conversationId);

    console.log(`🚪 Left room: ${conversationId}`);
  });

  // ===============================
  // 🔥 REAL-TIME MESSAGE BROADCAST (FIXED)
  // ===============================
  socket.on("sendMessage", ({ conversationId, message }) => {
    if (!conversationId || !message) return;

    console.log("📨 Message received:", message);

    // 🔥 SEND TO ALL USERS IN ROOM (INCLUDING SENDER)
    io.to(conversationId).emit("receiveMessage", message);
  });

  // ===============================
  // TYPING INDICATOR
  // ===============================
  socket.on("typing", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("typing", {
      conversationId,
      userId,
    });
  });

  socket.on("stopTyping", ({ conversationId }) => {
    socket.to(conversationId).emit("stopTyping", {
      conversationId,
    });
  });

  // ===============================
  // DISCONNECT
  // ===============================
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);

    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }
  });
});

// ===============================
// MIDDLEWARE
// ===============================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ===============================
// STATIC FILES
// ===============================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ===============================
// DATABASE
// ===============================
connectDB();

// ===============================
// ROUTES
// ===============================
const ticketRoutes = require("./src/routes/ticket.routes");
const authRoutes = require("./src/routes/auth.routes");
const messageRoutes = require("./src/routes/message.routes");
const conversationRoutes = require("./src/routes/conversation.routes");
const notificationRoutes = require("./src/routes/notification.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const userRoutes = require("./src/routes/user.routes");

app.use("/api/tickets", ticketRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.send("MollyTech API running 🚀");
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});