import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FaHeadset } from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import "./Login.css";

export default function Login() {

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();

    const { showToast } = useToast();

    const navigate = useNavigate();

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

            <div className="login-card">

                {/* LOGO */}

                <div className="login-logo">

                    <FaHeadset />

                </div>

                {/* BRAND */}

                <h1>

                    MollyTech

                </h1>

                <h2>

                    Service Desk System

                </h2>

                <p className="login-subtitle">

                    IT Support & Ticket Management Platform

                </p>

                {/* FORM */}

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

                    {/* BUTTON */}

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

                </form>

            </div>

        </div>

    );

}