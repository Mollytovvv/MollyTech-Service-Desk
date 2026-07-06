import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // =========================
  // LOAD FROM LOCAL STORAGE
  // =========================
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken) {
        setToken(savedToken);
      }

      if (savedUser && savedUser !== "undefined") {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.log("AUTH LOAD ERROR:", err);

      // safety reset if JSON is corrupted
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setAuthReady(true);
    }
  }, []);

  // =========================
  // LOGIN
  // =========================
  const login = (newToken, newUser) => {
    if (!newToken) return console.log("No token provided");
    if (!newUser) return console.log("No user provided");

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        authReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);