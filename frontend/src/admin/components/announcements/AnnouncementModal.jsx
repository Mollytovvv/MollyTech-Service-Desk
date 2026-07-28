import { useEffect, useState } from "react";

import api from "../../../api/axios";

import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

import {

    FiBell,
    FiSave,
    FiX,
    FiBookmark,

} from "react-icons/fi";

import "../../styles/AnnouncementModal.css";

export default function AnnouncementModal({

    announcement,

    onClose,

    onSaved,

}){

    const { token } = useAuth();

    const { showToast } = useToast();

    const [title,setTitle] = useState("");

    const [content,setContent] = useState("");

    const [pinned,setPinned] = useState(false);

    const [saving,setSaving] = useState(false);

    // =====================================
    // LOAD EDIT DATA
    // =====================================

    useEffect(()=>{

        if(!announcement) return;

        setTitle(
            announcement.title || ""
        );

        setContent(
            announcement.content || ""
        );

        setPinned(
            announcement.pinned || false
        );

    },[announcement]);

    // =====================================
    // SAVE
    // =====================================

    const handleSave = async()=>{

        if(!title.trim()){

            showToast(
                "error",
                "Title is required."
            );

            return;

        }

        if(!content.trim()){

            showToast(
                "error",
                "Content is required."
            );

            return;

        }

        try{

            setSaving(true);

            const payload={

                title,

                content,

                pinned,

            };

            if(announcement){

                await api.patch(

                    `/announcements/${announcement._id}`,

                    payload,

                    {

                        headers:{

                            Authorization:`Bearer ${token}`,

                        },

                    }

                );

                showToast(

                    "success",

                    "Announcement updated."

                );

            }

            else{

                await api.post(

                    "/announcements",

                    payload,

                    {

                        headers:{

                            Authorization:`Bearer ${token}`,

                        },

                    }

                );

                showToast(

                    "success",

                    "Announcement published."

                );

            }

            onSaved();

        }

        catch(err){

            console.log(err);

            showToast(

                "error",

                err.response?.data?.message ||

                "Something went wrong."

            );

        }

        finally{

            setSaving(false);

        }

    };

    return(

        <div

            className="announcement-modal-overlay"

            onClick={onClose}

        >

            <div

                className="announcement-modal"

                onClick={(e)=>e.stopPropagation()}

            >

                {/* ============================== */}

                {/* HEADER */}

                {/* ============================== */}

                <div className="announcement-modal-header">

                    <div className="announcement-modal-title">

                        <div className="announcement-icon">

                            <FiBell />

                        </div>

                        <div>

                            <h2>

                                {

                                    announcement

                                    ? "Edit Announcement"

                                    : "Create Announcement"

                                }

                            </h2>

                            <p>

                                Publish important company updates,

                                maintenance notices and announcements

                                visible to every user.

                            </p>

                        </div>

                    </div>

                    <button

                        className="modal-close"

                        onClick={onClose}

                    >

                        <FiX />

                    </button>

                </div>

                {/* ============================== */}

                {/* BODY */}

                {/* ============================== */}

                <div className="announcement-modal-content">

                    {/* ========================== */}

                    {/* LEFT */}

                    {/* ========================== */}

                    <div className="announcement-form">

                        <div className="form-group">

                            <label>

                                Announcement Title

                            </label>

                            <input

                                type="text"

                                maxLength={80}

                                placeholder="Enter announcement title..."

                                value={title}

                                onChange={(e)=>

                                    setTitle(

                                        e.target.value

                                    )

                                }

                            />

                            <div className="field-counter">

                                {title.length}/80

                            </div>

                        </div>

                        <div className="form-group">

                            <label>

                                Announcement Content

                            </label>

                            <textarea

                                rows={10}

                                maxLength={1000}

                                placeholder="Write your announcement..."

                                value={content}

                                onChange={(e)=>

                                    setContent(

                                        e.target.value

                                    )

                                }

                            />

                            <div className="field-counter">

                                {content.length}/1000

                            </div>

                        </div>

                        {/* ========================== */}

                        {/* PIN */}

                        {/* ========================== */}

                        <div className="pin-setting">

                            <div>

                                <h4>

                                    <FiBookmark />

                                    Pin Announcement

                                </h4>

                                <p>

                                    Keep this announcement at

                                    the top of the announcement

                                    feed for all users.

                                </p>

                            </div>

                            <button

                                type="button"

                                className={

                                    pinned

                                    ? "pin-toggle active"

                                    : "pin-toggle"

                                }

                                onClick={()=>

                                    setPinned(

                                        !pinned

                                    )

                                }

                            >

                                <span></span>

                            </button>

                        </div>

                    </div>

                    {/* ========================== */}

                    {/* RIGHT */}

                    {/* ========================== */}

                    <div className="announcement-preview">

                        <div className="preview-card">

                            <div className="preview-header">

                                <FiBell />

                                <span>

                                    Live Preview

                                </span>

                            </div>

                            <div className="preview-body">

                                <h3>

                                    {title.trim()
                                        ? title
                                        : "Announcement Title"}

                                </h3>

                                <div className="preview-badges">

                                    <span className="preview-status">

                                        Visible

                                    </span>

                                    {pinned && (

                                        <span className="preview-pinned">

                                            <FiBookmark />

                                            Pinned

                                        </span>

                                    )}

                                </div>

                                <p>

                                    {content.trim()
                                        ? content
                                        : "Your announcement preview will appear here as you type. This gives you an idea of how it will look before publishing."}

                                </p>

                            </div>

                            <div className="preview-footer">

                                <span>

                                    {new Date().toLocaleDateString([],{

                                        month:"long",

                                        day:"numeric",

                                        year:"numeric",

                                    })}

                                </span>

                                <span>

                                    MollyTech Service Desk

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ================================= */}

                {/* FOOTER */}

                {/* ================================= */}

                <div className="announcement-modal-footer">

                    <button

                        className="cancel-btn"

                        onClick={onClose}

                    >

                        Cancel

                    </button>

                    <button

                        className="save-btn"

                        onClick={handleSave}

                        disabled={saving}

                    >

                        <FiSave />

                        {

                            saving

                                ? "Publishing..."

                                : announcement

                                    ? "Save Changes"

                                    : "Publish Announcement"

                        }

                    </button>

                </div>

            </div>

        </div>

    );

}