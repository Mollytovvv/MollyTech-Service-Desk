import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useToast } from "../context/ToastContext";
import logo from "../assets/mollytech_logo.jpg";

import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

import "./Login.css";

export default function Login() {

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [mode, setMode] = useState("login");

    const { login } = useAuth();

    const { showToast } = useToast();

    const navigate = useNavigate();

    const switchMode = (newMode)=>{

        setEmail("");
        setPassword("");
        setMode(newMode);

    };    

    const handleLogin = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const res = await api.post("/auth/login", {

                email,
                password,

            });

            const { token, user } = res.data;

            if (!token || !user) {

                throw new Error("Invalid login response from server");

            }

            login(token, user);

            localStorage.setItem("token", token);

            localStorage.setItem("user", JSON.stringify(user));

            if (user.role === "admin") {

                navigate("/dashboard");

            }

            else if (
                user.role === "support" ||
                user.role === "technician"
            ) {

                navigate("/dashboard");

            }

            else if (user.role === "user") {

                navigate("/user/dashboard");

            }

            else {

                navigate("/");

            }

        }

        catch (err) {

            showToast(

                "error",

                err.response?.data?.message ||

                "Login failed"

            );

        }

        finally {

            setLoading(false);

        }

    };

return (

    <div className="login-page">

        {/* =========================
            LEFT PANEL
        ========================= */}

        <section className="login-brand">

            <div className="brand-content">

            <div className="brand-header">

            <div className="login-logo">

                <img
                    src={logo}
                    alt="MollyTech Logo"
                    className="brand-logo"
                />

            </div>

                <div className="brand-title">

                    <h1>

                        MollyTech

                    </h1>

                    <h2>

                        Service Desk System

                    </h2>

                </div>

            </div>

                <p className="brand-description">

                    A centralized IT support platform designed to streamline
                    ticket management, real-time communication, and support
                    operations for organizations of any size.

                </p>

                <div className="brand-features">

                    <div className="feature-item">

                        <i className="fa-solid fa-ticket"></i>

                        <span>

                            Ticket Management

                        </span>

                    </div>

                    <div className="feature-item">

                        <i className="fa-solid fa-comments"></i>

                        <span>

                            Real-Time Messaging

                        </span>

                    </div>

                    <div className="feature-item">

                        <i className="fa-solid fa-shield-halved"></i>

                        <span>

                            Secure Role-Based Access

                        </span>

                    </div>

                </div>

            </div>

        </section>


        {/* =========================
            RIGHT PANEL
        ========================= */}

        <section className="login-panel">

                    <div className="login-card">

            {
                mode === "login" ? (

                    <>
                        <div className="login-header">

                            <h3>

                                Welcome Back

                            </h3>

                            <p>

                                Sign in to continue to MollyTech Service Desk.

                            </p>

                        </div>

                        <form
                            className="login-form"
                            onSubmit={handleLogin}
                        >

                            {/* EMAIL */}

                            <div className="login-field">

                                <label>

                                    Email Address

                                </label>

                                <div className="login-input">

                                    <FiMail />

                                    <input

                                        type="email"

                                        placeholder="Enter your email"

                                        value={email}

                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }

                                        required

                                    />

                                </div>

                            </div>

                            {/* PASSWORD */}

                            <div className="login-field">

                                <label>

                                    Password

                                </label>

                                <div className="login-input">

                                    <FiLock />

                                    <input

                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }

                                        placeholder="Enter your password"

                                        value={password}

                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }

                                        required

                                    />

                                    <button

                                        type="button"

                                        className="password-toggle"

                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }

                                    >

                                        {

                                            showPassword

                                                ?

                                                <FiEyeOff />

                                                :

                                                <FiEye />

                                        }

                                    </button>

                                </div>

                            </div>

                            <button

                                className="login-btn"

                                type="submit"

                                disabled={loading}

                            >

                                {

                                    loading

                                        ?

                                        "Signing In..."

                                        :

                                        "Sign In"

                                }

                            </button>

                            <div className="login-actions">

                                <button

                                    type="button"

                                    className="forgot-link"

                                    onClick={() => switchMode("forgot")}

                                >

                                    Forgot password?

                                </button>

                            </div>

                            <div className="register-prompt">

                                <span>

                                    New to MollyTech?

                                </span>

                                <button

                                    type="button"

                                    onClick={() => switchMode("register")}

                                >

                                    Create Account

                                </button>

                            </div>

                        </form>

                        <div className="login-footer">

                            © 2026 MollyTech Service Desk

                        </div>

                    </>

                ) : mode === "register" ? (

                    <RegisterForm
                        setMode={setMode}
                    />

                ) : (

                    <ForgotPasswordForm
                        setMode={setMode}
                    />

                )
            }

            </div>

        </section>

    </div>
);
}