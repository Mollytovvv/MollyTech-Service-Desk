import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

import api from "../api/axios";
import { useToast } from "../context/ToastContext";

import logo from "../assets/mollytech_logo.jpg";

import "./Login.css";

export default function ResetPassword() {

    const { token } = useParams();

    const navigate = useNavigate();

    const { showToast } = useToast();

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const res = await api.post(

                `/auth/reset-password/${token}`,

                {

                    password,

                    confirmPassword,

                }

            );

            showToast(

                "success",

                res.data.message

            );

            setTimeout(() => {

                navigate("/");

            }, 2000);

        }

        catch (err) {

            showToast(

                "error",

                err.response?.data?.message ||

                "Failed to reset password"

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="login-page">

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

                        Create a new password for your account.

                    </p>

                </div>

            </section>

            <section className="login-panel">

                <div className="login-card">

                    <div className="login-header">

                        <h3>

                            Reset Password

                        </h3>

                        <p>

                            Enter your new password below.

                        </p>

                    </div>

                    <form

                        className="login-form"

                        onSubmit={handleSubmit}

                    >

                        <div className="login-field">

                            <label>

                                New Password

                            </label>

                            <div className="login-input">

                                <FiLock />

                                <input

                                    type={

                                        showPassword

                                            ? "text"

                                            : "password"

                                    }

                                    value={password}

                                    onChange={(e) =>

                                        setPassword(e.target.value)

                                    }

                                    placeholder="Enter new password"

                                    required

                                />

                                <button

                                    type="button"

                                    className="password-toggle"

                                    onClick={() =>

                                        setShowPassword(

                                            !showPassword

                                        )

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

                        <div className="login-field">

                            <label>

                                Confirm Password

                            </label>

                            <div className="login-input">

                                <FiLock />

                                <input

                                    type={

                                        showConfirmPassword

                                            ? "text"

                                            : "password"

                                    }

                                    value={confirmPassword}

                                    onChange={(e) =>

                                        setConfirmPassword(

                                            e.target.value

                                        )

                                    }

                                    placeholder="Confirm password"

                                    required

                                />

                                <button

                                    type="button"

                                    className="password-toggle"

                                    onClick={() =>

                                        setShowConfirmPassword(

                                            !showConfirmPassword

                                        )

                                    }

                                >

                                    {

                                        showConfirmPassword

                                            ?

                                            <FiEyeOff />

                                            :

                                            <FiEye />

                                    }

                                </button>

                            </div>

                        </div>

                        <button

                            type="submit"

                            className="login-btn"

                            disabled={loading}

                        >

                            {

                                loading

                                    ?

                                    "Updating..."

                                    :

                                    "Reset Password"

                            }

                        </button>

                    </form>

                </div>

            </section>

        </div>

    );

}