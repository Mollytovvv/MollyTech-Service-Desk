import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    FiLock,
    FiEye,
    FiEyeOff
} from "react-icons/fi";

import api from "../api/axios";
import { useToast } from "../context/ToastContext";

import logo from "../assets/mollytech_logo.jpg";

import "./Login.css";


export default function ResetPassword() {


    // =========================
    // ROUTE
    // =========================

    const { token } = useParams();

    const navigate = useNavigate();


    // =========================
    // CONTEXT
    // =========================

    const { showToast } = useToast();


    // =========================
    // FORM STATE
    // =========================

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");


    // =========================
    // UI STATE
    // =========================

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);


    // =========================
    // RESET PASSWORD
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (loading) return;


        // =========================
        // TOKEN VALIDATION
        // =========================

        if (!token) {

            showToast(
                "error",
                "Invalid password reset link."
            );

            return;

        }


        // =========================
        // PASSWORD VALIDATION
        // =========================

        if (password.length < 8) {

            showToast(
                "warning",
                "Password must be at least 8 characters."
            );

            return;

        }


        if (password !== confirmPassword) {

            showToast(
                "warning",
                "Passwords do not match."
            );

            return;

        }


        setLoading(true);


        try {

            const res = await api.post(

                `/auth/reset-password/${token}`,

                {
                    password,
                    confirmPassword
                }

            );


            showToast(

                "success",

                res.data?.message ||
                "Password has been reset successfully."

            );


            // =========================
            // CLEAR FORM
            // =========================

            setPassword("");

            setConfirmPassword("");

            setShowPassword(false);

            setShowConfirmPassword(false);


            // =========================
            // RETURN TO LOGIN
            // =========================

            setTimeout(() => {

                navigate("/");

            }, 2000);

        }

        catch (err) {

            console.error(
                "RESET PASSWORD ERROR:",
                err
            );


            showToast(

                "error",

                err.response?.data?.message ||

                "Failed to reset password."

            );

        }

        finally {

            setLoading(false);

        }

    };


    // =========================
    // RENDER
    // =========================

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

                        Create a new password for your account.

                    </p>


                </div>

            </section>


            {/* =========================
                RIGHT PANEL
            ========================= */}

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


                        {/* =========================
                            NEW PASSWORD
                        ========================= */}

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
                                        setPassword(
                                            e.target.value
                                        )
                                    }

                                    placeholder="Enter new password"

                                    autoComplete="new-password"

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


                        {/* =========================
                            CONFIRM PASSWORD
                        ========================= */}

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

                                    autoComplete="new-password"

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


                        {/* =========================
                            SUBMIT
                        ========================= */}

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