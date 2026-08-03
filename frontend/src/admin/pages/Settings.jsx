import { useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "../styles/Settings.css";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {

  // =========================
  // PASSWORD STATE
  // =========================
  const { showToast } = useToast();
  const { user } = useAuth();

  const displayName =
  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
  "MollyTech Service Desk";
  
  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =========================
  // CHANGE PASSWORD
  // =========================
  const handleChangePassword = async () => {

      // =========================
      // VALIDATION
      // =========================
      if (
          !currentPassword ||
          !newPassword ||
          !confirmPassword
      ) {

      return showToast(
          "warning",
          "Please complete all password fields."
      );

      }

      if (newPassword !== confirmPassword) {

        return showToast(
            "warning",
            "Passwords do not match."
        );

      }

      try {

          setLoading(true);

          await api.patch(
              "/auth/change-password",
              {
                  currentPassword,
                  newPassword,
                  confirmPassword,
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

      catch (err) {

      showToast(
          "error",
          err.response?.data?.message ||
          "Failed to update password."
      );

      }

      finally {

          setLoading(false);

      }

  };

    return (

        <div className="settings-page">

            {/* =========================
                SETTINGS WORKSPACE
            ========================= */}

            <div className="settings-workspace">

                {/* =========================
                    SETTINGS GRID
                ========================= */}

                <div className="settings-grid">

                    {/* =========================
                        ADMINISTRATOR ACCOUNT
                    ========================= */}

                    <section className="settings-card">

                        <div className="settings-card-header">

                            <i className="fa-solid fa-user-shield"></i>

                            <h2>
                                {user?.role === "admin"
                                    ? "Administrator Account"
                                    : user?.role === "technician"
                                    ? "Technician Account"
                                    : "IT Support Account"}
                            </h2>

                        </div>

                        <div className="settings-card-body">

                            <div className="profile-summary">

                                <div className="profile-logo">

                                    <i className="fa-solid fa-building"></i>

                                </div>

                                <div className="profile-details">

                                    <h3>{displayName}</h3>

                                    <p>
                                        {user?.role === "admin"
                                            ? "Administrator"
                                            : user?.role === "technician"
                                            ? "Technician"
                                            : "IT Support"}
                                    </p>

                                </div>

                            </div>

                            <div className="settings-form">

                                <div className="settings-field">

                                    <label>
                                        Display Name
                                    </label>

                                    <div className="settings-value">
                                        {displayName}
                                    </div>

                                </div>

                                <div className="settings-field">

                                    <label>
                                        Email Address
                                    </label>

                                    <div className="settings-value">

                                        {user?.email}

                                    </div>

                                </div>

                                <div className="settings-field">

                                    <label>
                                        Phone Number
                                    </label>

                                    <div className="settings-value">
                                        {user?.phoneNumber || "N/A"}
                                    </div>

                                </div>

                                <div className="settings-field">

                                    <label>
                                        Role
                                    </label>

                                    <div className="settings-value">

                                        {user?.role === "admin"
                                            ? "Administrator"
                                            : user?.role === "technician"
                                            ? "Technician"
                                            : "IT Support"}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>

                    {/* =========================
                        SECURITY
                    ========================= */}

                    <section className="settings-card security-card">

                        <div className="settings-card-header">

                            <i className="fa-solid fa-lock"></i>

                            <h2>
                                Security
                            </h2>

                        </div>

                        <div className="settings-card-body">

                            <p className="security-description">
                                Change your password to keep your account secure.
                            </p>

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
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                />

                                <i
                                    className={
                                        showCurrentPassword
                                        ? "fa-solid fa-eye-slash"
                                        : "fa-solid fa-eye"
                                    }
                                    onClick={() =>
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

                                        {loading
                                            ? "Updating..."
                                            : "Update Password"}

                                    </button>

                            </div>

                        </div>

                    </section>

                </div>

                {/* =========================
                    ABOUT
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
                            A centralized IT support platform designed to manage IT support requests, ticket tracking, and real-time communication between administrators and users.
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

                        <div className="about-item">

                            <span>
                                Developer
                            </span>

                            <strong>
                                Ralph Michael Molina
                            </strong>

                        </div>

                    </div>

                </aside>

            </div>

        </div>

    );

}