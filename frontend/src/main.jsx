import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

import "./global.css";
import "@fortawesome/fontawesome-free/css/all.min.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>

    <NotificationProvider>

      <BrowserRouter>
        <App />
      </BrowserRouter>

    </NotificationProvider>

  </AuthProvider>
);