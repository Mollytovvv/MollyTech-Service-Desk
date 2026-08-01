import { io } from "socket.io-client";


// ===============================
// SINGLE SOCKET INSTANCE
// ===============================
const socket = io(
  "http://localhost:5000",
  {
    autoConnect:false,
    transports:[
      "websocket"
    ],
  }
);



// ===============================
// CONNECT SOCKET
// ===============================
export const connectSocket = (
  userId,
  role
)=>{

  if(!userId) return;


  if(!socket.connected){

    socket.connect();

  }



  socket.emit(
    "register",
    {
      userId,
      role,
    }
  );


};



// ===============================
// DISCONNECT SOCKET
// ===============================
export const disconnectSocket = ()=>{

  if(socket.connected){

    socket.disconnect();

  }

};



// ===============================
// EXPORT INSTANCE
// ===============================
export default socket;