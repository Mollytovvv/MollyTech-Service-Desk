import { useState } from "react";

import { FiMail } from "react-icons/fi";

import api from "../api/axios";
import { useToast } from "../context/ToastContext";

export default function ForgotPasswordForm({ setMode }) {

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const { showToast } = useToast();

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const res = await api.post(

                "/auth/forgot-password",

                {
                    email
                }

            );

            showToast(

                "success",

                res.data.message

            );

            setEmail("");

        }

        catch (err) {

            showToast(

                "error",

                err.response?.data?.message ||

                "Failed to send reset email"

            );

        }

        finally {

            setLoading(false);

        }

    };

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