import { useState } from "react";

import { FiMail } from "react-icons/fi";

import api from "../api/axios";
import { useToast } from "../context/ToastContext";


export default function ForgotPasswordForm({ setMode }) {


    // =========================
    // FORM STATE
    // =========================

    const [email, setEmail] = useState("");


    // =========================
    // UI STATE
    // =========================

    const [loading, setLoading] = useState(false);


    const { showToast } = useToast();


    // =========================
    // SEND RESET LINK
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (loading) return;


        const normalizedEmail =
            email.trim().toLowerCase();


        if (!normalizedEmail) {

            showToast(
                "warning",
                "Please enter your email address."
            );

            return;

        }


        setLoading(true);


        try {

            const res = await api.post(
                "/auth/forgot-password",
                {
                    email: normalizedEmail
                }
            );


            showToast(
                "success",
                res.data?.message ||
                "If the email exists, a password reset link has been sent."
            );

        }

        catch (err) {

            console.error(
                "FORGOT PASSWORD ERROR:",
                err
            );


            showToast(
                "error",
                err.response?.data?.message ||
                "Failed to send reset email."
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

        <>

            {/* =========================
                HEADER
            ========================= */}

            <div className="login-header">

                <h3>
                    Forgot Password
                </h3>

                <p>
                    Enter your email address and we'll send you a password reset link.
                </p>

            </div>


            {/* =========================
                FORM
            ========================= */}

            <form
                className="login-form"
                onSubmit={handleSubmit}
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

                            autoComplete="email"

                            required

                        />

                    </div>

                </div>


                {/* SUBMIT */}

                <button

                    type="submit"

                    className="login-btn"

                    disabled={loading}

                >

                    {

                        loading

                            ?

                            "Sending..."

                            :

                            "Send Reset Link"

                    }

                </button>


                {/* =========================
                    BACK TO LOGIN
                ========================= */}

                <div className="register-prompt">

                    <span>
                        Remember your password?
                    </span>


                    <button

                        type="button"

                        onClick={() =>
                            setMode("login")
                        }

                    >

                        Back to Sign In

                    </button>

                </div>


            </form>


            <div className="login-footer">

                © 2026 MollyTech Service Desk

            </div>

        </>

    );

}