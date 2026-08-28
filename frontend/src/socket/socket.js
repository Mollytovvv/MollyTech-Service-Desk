import { io } from "socket.io-client";


// ===============================
// SINGLE SOCKET INSTANCE
// ===============================

const socket = io(
    import.meta.env.VITE_API_URL || "http://localhost:5000",
    {
        autoConnect: false,

        transports: [
            "websocket"
        ],
    }
);


// ===============================
// CURRENT SOCKET USER
// ===============================

let currentUser = {
    userId: null,
    role: null
};


// ===============================
// REGISTER CURRENT USER
// ===============================

const registerCurrentUser = () => {

    if (
        !socket.connected ||
        !currentUser.userId ||
        !currentUser.role
    ) {

        return;

    }


    socket.emit(
        "register",
        {
            userId: currentUser.userId,
            role: currentUser.role
        }
    );


    console.log(
        "SOCKET REGISTERED:",
        currentUser
    );

};


// ===============================
// SOCKET CONNECTED
// ===============================

socket.on(
    "connect",
    () => {

        console.log(
            "SOCKET CONNECTED:",
            socket.id
        );


        registerCurrentUser();

    }
);


// ===============================
// SOCKET DISCONNECTED
// ===============================

socket.on(
    "disconnect",
    (reason) => {

        console.log(
            "SOCKET DISCONNECTED:",
            reason
        );

    }
);


// ===============================
// SOCKET CONNECTION ERROR
// ===============================

socket.on(
    "connect_error",
    (error) => {

        console.error(
            "SOCKET CONNECTION ERROR:",
            error.message
        );

    }
);


// ===============================
// CONNECT SOCKET
// ===============================

export const connectSocket = (
    userId,
    role
) => {

    if (!userId || !role) {

        console.warn(
            "SOCKET CONNECT: Missing userId or role."
        );

        return;

    }


    currentUser = {
        userId,
        role
    };


    if (!socket.connected) {

        socket.connect();

    }

    else {

        registerCurrentUser();

    }

};


// ===============================
// DISCONNECT SOCKET
// ===============================

export const disconnectSocket = () => {

    currentUser = {
        userId: null,
        role: null
    };


    if (socket.connected) {

        socket.disconnect();

    }

};


// ===============================
// EXPORT SOCKET INSTANCE
// ===============================

export default socket;