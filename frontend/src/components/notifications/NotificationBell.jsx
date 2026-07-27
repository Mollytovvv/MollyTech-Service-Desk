import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

import "./NotificationBell.css";

function NotificationBell() {

  const [open, setOpen] = useState(false);

  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications();

// ===============================
// 🔔 HANDLE NOTIFICATION CLICK
// ===============================
const handleNotificationClick = (notification) => {

  // ===============================
  // MARK AS READ
  // ===============================
  markAsRead(notification._id);


  // ===============================
  // NOTIFICATION ROUTING
  // ===============================
  switch(notification.type){


    // ===============================
    // 🎫 NEW TICKET CREATED
    // ADMIN ONLY
    // ===============================
    case "new_ticket":

      if(user.role === "admin"){

        navigate("/ticket-center");

      }

      break;



    // ===============================
    // 📌 TICKET STATUS UPDATES
    // USER + ADMIN
    // ===============================
    case "ticket_assigned":

    case "ticket_updated":

    case "ticket_resolved":

    case "ticket_reopened":


      // USER VIEW
      if(user.role === "user"){

        navigate("/user/tickets");

      }


      // ADMIN VIEW
      else if(user.role === "admin"){

        navigate("/ticket-center");

      }


      break;



    // ===============================
    // 💬 NEW MESSAGE
    // OPEN EXACT CONVERSATION
    // ===============================
    case "new_message":


      // USER MESSAGE VIEW
      if(user.role === "user") {

        navigate(
          `/user/messages?conversation=${notification.conversationId}`
        );

      }


      // ADMIN / TECHNICIAN MESSAGE VIEW
      else if(
        user.role === "admin" ||
        user.role === "technician"
      ) {

        navigate(
          `/messages?conversation=${notification.conversationId}`
        );

      }


      break;



    // ===============================
    // 👤 NEW ACCESS REQUEST
    // ADMIN ONLY
    // ===============================
    case "access_request":

      if(user.role === "admin"){

        navigate("/access-requests");

      }

      break;
      
    // ===============================
    // DEFAULT
    // UNKNOWN NOTIFICATION TYPE
    // ===============================
    default:

      break;

  }


  // ===============================
  // CLOSE DROPDOWN
  // ===============================
  setOpen(false);

};


// ===============================
// 🔔 NOTIFICATION ICON
// ===============================
const getNotificationIcon = (type) => {

  switch(type) {

    case "new_ticket":
      return "fa-ticket";

    case "ticket_assigned":
      return "fa-user-check";

    case "ticket_resolved":
      return "fa-circle-check";

    case "ticket_reopened":
      return "fa-rotate-left";

    case "new_message":
      return "fa-message";


    // ===============================
    // 👤 ACCESS REQUEST
    // ADMIN ONLY
    // ===============================
    case "access_request":
      return "fa-user-clock";


    // ===============================
    // ACCOUNT STATUS
    // ===============================
    case "account_approved":
      return "fa-user-check";


    case "account_rejected":
      return "fa-user-xmark";


    case "system":
      return "fa-circle-info";


    default:
      return "fa-bell";

  }

};

// ===============================
// 🔽 CLOSE DROPDOWN WHEN CLICKING OUTSIDE
// ===============================
useEffect(() => {

  const handleClickOutside = (event) => {

    if(
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ){

      setOpen(false);

    }

  };


  document.addEventListener(
    "mousedown",
    handleClickOutside
  );


  return () => {

    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );

  };


}, []);

  return (
        <div
        className="notification-wrapper"
        ref={notificationRef}
        >


      {/* 🔔 BELL BUTTON */}
      <button
        className="notification-bell"
        onClick={() => setOpen(!open)}
      >

        <i className="fa-solid fa-bell"></i>


        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount}
          </span>
        )}

      </button>



      {/* DROPDOWN */}
      {open && (

        <div className="notification-dropdown">


          <div className="notification-header">

            <h3>
              Notifications
            </h3>


            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}

          </div>



          <div className="notification-list">


            {notifications.length === 0 ? (

              <p className="empty-notification">
                No notifications
              </p>

            ) : (


              notifications.map((notification)=>(
                
            <div
            key={notification._id}
            className={
                notification.isRead
                ? "notification-item read"
                : "notification-item"
            }
            onClick={() =>
                handleNotificationClick(notification)
            }
            >


            <div className="notification-icon">

                <i
                className={`fa-solid ${getNotificationIcon(notification.type)}`}
                ></i>

            </div>


            <div className="notification-content">

                <h4>
                {notification.title}
                </h4>


                <p>
                {notification.message}
                </p>


                <small>
                {new Date(
                    notification.createdAt
                ).toLocaleString()}
                </small>

            </div>


            </div>

              ))

            )}


          </div>


        </div>

      )}


    </div>
  );
}


export default NotificationBell;