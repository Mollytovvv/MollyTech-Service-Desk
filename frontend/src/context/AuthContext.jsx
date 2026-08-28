import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    connectSocket,
    disconnectSocket
} from "../socket/socket";


const AuthContext = createContext(null);


// =========================
// 🔐 AUTH PROVIDER
// =========================

export const AuthProvider = ({ children }) => {


    // =========================
    // LOAD TOKEN
    // =========================

    const [token, setToken] = useState(() => {

        return localStorage.getItem("token");

    });


    // =========================
    // LOAD USER
    // =========================

    const [user, setUser] = useState(() => {

        const savedUser =
            localStorage.getItem("user");


        if (
            !savedUser ||
            savedUser === "undefined" ||
            savedUser === "null"
        ) {

            return null;

        }


        try {

            return JSON.parse(savedUser);

        }

        catch (err) {

            console.error(
                "AUTH USER LOAD ERROR:",
                err
            );

            localStorage.removeItem("user");

            return null;

        }

    });


    // =========================
    // AUTH READY
    // =========================

    const authReady = true;


    // =========================
    // SOCKET CONNECTION
    // =========================

    useEffect(() => {

        if (!user?._id || !user?.role) {

            disconnectSocket();

            return;

        }


        connectSocket(
            user._id,
            user.role
        );


        return () => {

            disconnectSocket();

        };

    }, [user?._id, user?.role]);


    // =========================
    // 🔑 LOGIN
    // =========================

    const login = (newToken, newUser) => {

        if (!newToken) {

            console.error(
                "AUTH LOGIN ERROR: Missing token."
            );

            return false;

        }


        if (!newUser || !newUser._id) {

            console.error(
                "AUTH LOGIN ERROR: Invalid user."
            );

            return false;

        }


        // =========================
        // SAVE AUTH DATA
        // =========================

        localStorage.setItem(
            "token",
            newToken
        );


        localStorage.setItem(
            "user",
            JSON.stringify(newUser)
        );


        // =========================
        // UPDATE STATE
        // =========================

        setToken(newToken);

        setUser(newUser);


        return true;

    };


    // =========================
    // 🚪 LOGOUT
    // =========================

    const logout = () => {

        disconnectSocket();


        localStorage.removeItem("token");

        localStorage.removeItem("user");


        setToken(null);

        setUser(null);

    };


    // =========================
    // CONTEXT
    // =========================

    return (

        <AuthContext.Provider

            value={{
                token,
                user,
                login,
                logout,
                authReady
            }}

        >

            {children}

        </AuthContext.Provider>

    );

};


// =========================
// 🧩 USE AUTH HOOK
// =========================

export const useAuth = () => {

    const context =
        useContext(AuthContext);


    if (!context) {

        throw new Error(
            "useAuth must be used inside an AuthProvider"
        );

    }


    return context;

};