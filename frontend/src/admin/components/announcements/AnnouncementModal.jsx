import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

import {
  FiX,
  FiSave,
  FiBell,
} from "react-icons/fi";

import "../../styles/AnnouncementModal.css";

export default function AnnouncementModal({
  announcement,
  onClose,
  onSaved,
}) {

  const { token } = useAuth();

  const { showToast } = useToast();

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  const [type, setType] = useState("info");

  const [pinned, setPinned] = useState(false);

  const [saving, setSaving] = useState(false);

  // =========================
  // LOAD EDIT DATA
  // =========================

  useEffect(() => {

    if (!announcement) return;

    setTitle(
      announcement.title || ""
    );

    setContent(
      announcement.content || ""
    );

    setType(
      announcement.type || "info"
    );

    setPinned(
      announcement.pinned || false
    );

  }, [announcement]);

  // =========================
  // SAVE
  // =========================

  const handleSave = async () => {

    if (!title.trim()) {

      showToast(
        "error",
        "Title is required."
      );

      return;

    }

    if (!content.trim()) {

      showToast(
        "error",
        "Content is required."
      );

      return;

    }

    try {

      setSaving(true);

      const payload = {

        title,

        content,

        type,

        pinned,

      };

      if (announcement) {

        await api.patch(

          `/announcements/${announcement._id}`,

          payload,

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }

        );

        showToast(
          "success",
          "Announcement updated."
        );

      } else {

        await api.post(

          "/announcements",

          payload,

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }

        );

        showToast(
          "success",
          "Announcement published."
        );

      }

      onSaved();

    } catch (err) {

      console.log(err);

      showToast(
        "error",
        err.response?.data?.message ||
        "Something went wrong."
      );

    } finally {

      setSaving(false);

    }

  };

  return (

    <div
      className="announcement-modal-overlay"
      onClick={onClose}
    >

      <div
        className="announcement-modal"
        onClick={(e)=>e.stopPropagation()}
      >

        <div className="announcement-modal-header">

          <div className="announcement-modal-title">

            <FiBell />

            <div>

              <h2>

                {announcement
                  ? "Edit Announcement"
                  : "Create Announcement"}

              </h2>

              <p>

                Publish announcements
                for all users.

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

        <div className="announcement-modal-body">

          <div className="form-group">

            <label>

              Title

            </label>

            <input
              type="text"
              placeholder="Announcement title"
              value={title}
              onChange={(e)=>
                setTitle(
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>

              Type

            </label>

            <select
              value={type}
              onChange={(e)=>
                setType(
                  e.target.value
                )
              }
            >

              <option value="info">

                Information

              </option>

              <option value="maintenance">

                Maintenance

              </option>

              <option value="warning">

                Warning

              </option>

              <option value="success">

                Success

              </option>

            </select>

          </div>

          <div className="form-group">

            <label>

              Content

            </label>

            <textarea
              rows={6}
              placeholder="Write your announcement..."
              value={content}
              onChange={(e)=>
                setContent(
                  e.target.value
                )
              }
            />

          </div>

          <label className="announcement-checkbox">

            <input
              type="checkbox"
              checked={pinned}
              onChange={(e)=>
                setPinned(
                  e.target.checked
                )
              }
            />

            Pin this announcement

          </label>

        </div>

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

            {saving
              ? "Saving..."
              : announcement
              ? "Save Changes"
              : "Publish"}

          </button>

        </div>

      </div>

    </div>

  );

}