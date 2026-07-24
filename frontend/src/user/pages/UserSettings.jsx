import { useEffect, useState } from "react";

import api from "../../api/axios";

import { useToast } from "../../context/ToastContext";

import "../styles/UserSettings.css";


export default function UserSettings(){

    const { showToast } = useToast();


    // =========================
    // PROFILE STATE
    // =========================

    const [firstName,setFirstName] = useState("");

    const [lastName,setLastName] = useState("");

    const [email, setEmail] = useState("");

    const [phone, setPhone] = useState("");

    const [savingProfile, setSavingProfile] = useState(false);

    const [profileLoading, setProfileLoading] = useState(true);


    // =========================
    // PASSWORD STATE
    // =========================

    const [currentPassword, setCurrentPassword] = useState("");

    const [newPassword, setNewPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const [showNewPassword, setShowNewPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ===============================
    // FETCH PROFILE
    // ===============================
    const fetchProfile = async () => {

        try {

            setProfileLoading(true);

            const res = await api.get(
                "/users/me"
            );


            setFirstName(
                res.data.firstName
            );


            setLastName(
                res.data.lastName
            );


            setEmail(
                res.data.email
            );

            setPhone(
                res.data.phone || ""
            );


        } catch (err) {

            showToast(
                "error",
                "Failed to load profile."
            );

        }
        finally {

            setProfileLoading(false);

        }

    };

    useEffect(() => {

        fetchProfile();

    }, []);

    // ===============================
    // UPDATE PROFILE
    // ===============================
    const handleUpdateProfile = async () => {

        try {

            setSavingProfile(true);


            await api.patch(
                "/users/update-profile",
                {
                    email,
                    phone
                }
            );

            showToast(
                "success",
                "Profile updated successfully."
            );


            fetchProfile();


        } catch(err){

            showToast(
                "error",
                err.response?.data?.message ||
                "Failed to update profile."
            );

        }
        finally{

            setSavingProfile(false);

        }

    };

    // =========================
    // CHANGE PASSWORD
    // =========================

    const handleChangePassword = async()=>{

        if(
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ){

            return showToast(
                "warning",
                "Please complete all password fields."
            );

        }


        if(newPassword !== confirmPassword){

            return showToast(
                "warning",
                "Passwords do not match."
            );

        }


        try{

            setLoading(true);


            await api.patch(
                "/auth/change-password",
                {
                    currentPassword,
                    newPassword,
                    confirmPassword
                }
            );


            showToast(
                "success",
                "Password updated successfully."
            );


            setCurrentPassword("");

            setNewPassword("");

            setConfirmPassword("");


        }
        catch(err){

            showToast(
                "error",
                err.response?.data?.message ||
                "Failed to update password."
            );

        }
        finally{

            setLoading(false);

        }

    };


    return(

        <div className="settings-page">

            <div className="settings-workspace">


                <div className="settings-grid">


                    {/* =========================
                        USER ACCOUNT
                    ========================= */}

                    <section className="settings-card">

                        <div className="settings-card-body">


                        <div className="profile-summary">

                            <div className="profile-logo">

                                <i className="fa-solid fa-user"></i>

                            </div>

                            <div className="profile-details">

                                <h3>
                                    Account Information
                                </h3>

                                <p>
                                    Update your email address and contact number.
                                </p>

                            </div>

                        </div>

                            <div className="settings-form">


                                <div className="settings-field">

                                    <label>
                                        First Name
                                    </label>

                                    <input
                                        type="text"
                                        value={firstName}
                                        disabled
                                    />

                                </div>



                                <div className="settings-field">

                                    <label>
                                        Last Name
                                    </label>

                                    <input
                                        type="text"
                                        value={lastName}
                                        disabled
                                    />

                                </div>


                                <div className="settings-field">

                                    <label>
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e)=>setEmail(e.target.value)}
                                    />

                                </div>


                                <div className="settings-field">

                                    <label>
                                        Phone Number
                                    </label>

                                <div className="phone-input">

                                    <span>
                                        +63
                                    </span>

                                    <input
                                        type="text"
                                        placeholder="917 123 4567"
                                        value={
                                            phone
                                            ? phone.replace(
                                                /(\d{3})(\d{3})(\d{4})/,
                                                "$1 $2 $3"
                                            )
                                            : ""
                                        }
                                        onChange={(e)=>
                                            setPhone(e.target.value.replace(/\D/g,""))
                                        }
                                    />

                                </div>

                                </div>


                                    <button
                                        className="settings-save-btn"
                                        onClick={handleUpdateProfile}
                                        disabled={savingProfile}
                                    >

                                    {
                                        savingProfile
                                        ?
                                        "Saving..."
                                        :
                                        "Save Changes"
                                    }

                                </button>


                            </div>


                        </div>


                    </section>



                    {/* =========================
                        SECURITY
                    ========================= */}

                    <section className="settings-card security-card">

                        <div className="settings-card-body">

                            {/* SECURITY SUMMARY */}

                            <div className="profile-summary">

                                <div className="profile-logo">

                                    <i className="fa-solid fa-lock"></i>

                                </div>

                                <div className="profile-details">

                                    <h3>
                                        Account Security
                                    </h3>

                                    <p>
                                        Update your password to keep your account secure.
                                    </p>

                                </div>

                            </div>


                            {/* SECURITY NOTICE */}

                            <div className="security-notice">

                                <i className="fa-solid fa-shield-halved"></i>

                                <span>
                                    Use a strong password with at least 8 characters. Never share your password with anyone.
                                </span>

                            </div>


                            {/* SECURITY FORM */}

                            <div className="settings-form">

                                <div className="settings-field">

                                    <label>
                                        Current Password
                                    </label>

                                    <div className="password-input">

                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            placeholder="Enter current password"
                                            value={currentPassword}
                                            onChange={(e)=>
                                                setCurrentPassword(e.target.value)
                                            }
                                        />

                                        <i
                                            className={
                                                showCurrentPassword
                                                ? "fa-solid fa-eye-slash"
                                                : "fa-solid fa-eye"
                                            }
                                            onClick={()=>
                                                setShowCurrentPassword(!showCurrentPassword)
                                            }
                                        ></i>

                                    </div>

                                </div>


                                <div className="settings-field">

                                    <label>
                                        New Password
                                    </label>

                                    <div className="password-input">

                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(e.target.value)
                                            }
                                        />

                                        <i
                                            className={
                                                showNewPassword
                                                    ? "fa-solid fa-eye-slash"
                                                    : "fa-solid fa-eye"
                                            }
                                            onClick={() =>
                                                setShowNewPassword(!showNewPassword)
                                            }
                                        ></i>

                                    </div>

                                </div>


                                <div className="settings-field">

                                    <label>
                                        Confirm Password
                                    </label>

                                    <div className="password-input">

                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm password"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(e.target.value)
                                            }
                                        />

                                        <i
                                            className={
                                                showConfirmPassword
                                                    ? "fa-solid fa-eye-slash"
                                                    : "fa-solid fa-eye"
                                            }
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                        ></i>

                                    </div>

                                </div>


                                <button
                                    className="settings-save-btn"
                                    onClick={handleChangePassword}
                                    disabled={loading}
                                >

                                    {
                                        loading
                                            ? "Updating..."
                                            : "Update Password"
                                    }

                                </button>

                            </div>

                        </div>

                    </section>

                </div>


                {/* =========================
                    ABOUT MOLLYTECH
                ========================= */}


                <aside className="settings-about">


                    <div className="about-header">

                        <i className="fa-solid fa-circle-info"></i>

                        <h2>
                            About MollyTech
                        </h2>

                    </div>



                    <div className="about-content">


                        <h3>
                            MollyTech Service Desk System
                        </h3>



                        <p>
                            A centralized IT support platform designed to manage service requests, ticket tracking, and real-time communication between users and support staff.
                        </p>




                        <div className="about-item">

                            <span>
                                Version
                            </span>

                            <strong>
                                1.0.0
                            </strong>

                        </div>



                        <div className="about-item">

                            <span>
                                Frontend
                            </span>

                            <strong>
                                React + Vite
                            </strong>

                        </div>



                        <div className="about-item">

                            <span>
                                Backend
                            </span>

                            <strong>
                                Node.js + Express
                            </strong>

                        </div>



                        <div className="about-item">

                            <span>
                                Database
                            </span>

                            <strong>
                                MongoDB
                            </strong>

                        </div>



                        <div className="about-item">

                            <span>
                                Real-Time
                            </span>

                            <strong>
                                Socket.IO
                            </strong>

                        </div>


                    </div>


                </aside>



            </div>

        </div>

    );

}