import { createContext, useContext, useState, useEffect } from "react";
import {
  connectSocket,
  disconnectSocket,
} from "../socket/socket";


const AuthContext = createContext();

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

    const savedUser = localStorage.getItem("user");


    if(savedUser && savedUser !== "undefined"){

      try{

        return JSON.parse(savedUser);

      }
      catch(err){

        console.log(
          "USER LOAD ERROR:",
          err
        );

        localStorage.removeItem("user");

      }

    }


    return null;


  });

  const authReady = true;

  // =========================
  // SOCKET CONNECTION
  // =========================
  useEffect(()=>{


    if(user?._id){

      connectSocket(user._id);

    }


    return()=>{

      disconnectSocket();

    };


  },[user]);

  // =========================
  // LOGIN
  // =========================
  const login = (newToken,newUser)=>{

    if(!newToken){

      console.log("No token provided");

      return;

    }

    if(!newUser){

      console.log("No user provided");

      return;

    }

    localStorage.setItem(
      "token",
      newToken
    );


    localStorage.setItem(
      "user",
      JSON.stringify(newUser)
    );

    setToken(newToken);

    setUser(newUser);

  };

  // =========================
  // LOGOUT
  // =========================
  const logout = ()=>{

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setToken(null);

    setUser(null);

  };

  return(

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

export const useAuth = ()=>useContext(AuthContext);