import { io } from "socket.io-client";

// ===============================
// SINGLE SOCKET INSTANCE
// ===============================
const socket = io("http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket"],
});

// ===============================
// CONNECT SOCKET (ONLY ONCE)
// ===============================
export const connectSocket = (userId) => {
  if (!userId) return;

  // prevent duplicate connection
  if (!socket.connected) {
    socket.connect();
  }

  socket.emit("register", userId);
};

// ===============================
// DISCONNECT SOCKET
// ===============================
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// ===============================
// EXPORT SOCKET INSTANCE
// ===============================
export default socket;