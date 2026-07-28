import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiBell,
  FiFolder,
  FiMessageCircle,
  FiPlus,
  FiSettings,
} from "react-icons/fi";

import api from "../../api/axios";
import socket from "../../socket/socket";
import { useAuth } from "../../context/AuthContext";

import UserTopCards from "../components/UserTopCards";
import CreateTicketModal from "../components/CreateTicketModal";

import "../styles/UserDashboard.css";

export default function UserDashboard() {

  const { token, user } = useAuth();

  const navigate = useNavigate();


  const [showCreateTicket, setShowCreateTicket] = useState(false);

  const [loading, setLoading] = useState(true);


  const [announcements, setAnnouncements] = useState([]);


  const [dashboard, setDashboard] = useState({

    stats: {

      total:0,

      pending:0,

      messages:0,

      resolved:0,

    },

    recentTickets:[],

  });



  // =====================================
  // FETCH DASHBOARD
  // =====================================

  const fetchDashboard = async()=>{

    try{

      const res = await api.get(

        "/tickets/my/dashboard",

        {

          headers:{

            Authorization:`Bearer ${token}`,

          },

        }

      );


      setDashboard(res.data);


    }

    catch(err){

      console.log(
        err.response?.data || err.message
      );

    }

    finally{

      setLoading(false);

    }

  };



  // =====================================
  // FETCH ANNOUNCEMENTS
  // =====================================

  const fetchAnnouncements = async()=>{

    try{

      const res = await api.get(

        "/announcements",

        {

          headers:{

            Authorization:`Bearer ${token}`,

          },

        }

      );


      const activeAnnouncements =

        (res.data.announcements || [])

        .filter(

          (announcement)=>

            announcement.active

        )

        .sort(

          (a,b)=>

            Number(b.pinned) -
            Number(a.pinned)

            ||

            new Date(b.createdAt) -
            new Date(a.createdAt)

        );


      setAnnouncements(
        activeAnnouncements
      );


    }

    catch(err){

      console.log(
        err.response?.data || err.message
      );

    }

  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(()=>{

    if(!token) return;


    fetchDashboard();

    fetchAnnouncements();


  },[token]);



  // =====================================
  // SOCKET REAL TIME
  // =====================================

  useEffect(()=>{


    if(!user) return;



    // Existing ticket updates

    socket.on(

      "ticketUpdated",

      fetchDashboard

    );



    // New announcement

    socket.on(

      "announcementCreated",

      (announcement)=>{


        if(!announcement.active)
          return;



        setAnnouncements(prev=>{


          const updated = [

            announcement,

            ...prev,

          ];



          return updated.sort(

            (a,b)=>

              Number(b.pinned) -
              Number(a.pinned)

              ||

              new Date(b.createdAt)
              -
              new Date(a.createdAt)

          );


        });


      }

    );



    // Announcement updated

    socket.on(

      "announcementUpdated",

      (announcement)=>{


        setAnnouncements(prev=>{


          const filtered = prev.filter(

            item=>

              item._id !== announcement._id

          );



          if(!announcement.active){

            return filtered;

          }



          return [

            announcement,

            ...filtered,

          ].sort(

            (a,b)=>

              Number(b.pinned) -
              Number(a.pinned)

              ||

              new Date(b.createdAt)
              -
              new Date(a.createdAt)

          );


        });


      }

    );



    // Announcement deleted

    socket.on(

      "announcementDeleted",

      (id)=>{


        setAnnouncements(prev=>

          prev.filter(

            item=>

              item._id !== id

          )

        );


      }

    );



    return()=>{


      socket.off(

        "ticketUpdated",

        fetchDashboard

      );


      socket.off(

        "announcementCreated"

      );


      socket.off(

        "announcementUpdated"

      );


      socket.off(

        "announcementDeleted"

      );


    };


  },[user]);



  if(loading){

    return(

      <div className="user-dashboard loading">

        Loading dashboard...

      </div>

    );

  }

  return (
    <div className="user-dashboard">
      {/* HEADER */}
      <section className="dashboard-intro">
        <div>
          <h2>
            Welcome back, {user?.firstName} {user?.lastName} 👋
          </h2>
          <p>How can we assist you today?</p>
        </div>
      </section>

      <UserTopCards stats={dashboard.stats} />

      {/* MAIN WORKSPACE */}
      <div className="workspace">
        {/* RECENT TICKETS */}
        <section className="work-area">
          <div className="panel-header panel-header-row">
            <div>
              <h2>Recent Tickets</h2>
              <p>Manage your submitted support requests</p>
            </div>

            <button
              className="view-all-btn"
              onClick={() => navigate("/user/tickets")}
            >
              View All
            </button>
          </div>

          <div className="ticket-list-scroll">
            {dashboard.recentTickets?.length === 0 ? (
              <div className="empty-state">
                <h3>No tickets yet</h3>
                <p>
                  Create your first support ticket to get assistance from IT.
                </p>
              </div>
            ) : (
              dashboard.recentTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="ticket-row"
                >
                  <div className="ticket-icon">🎫</div>

                  <div className="ticket-content">
                    <span className="ticket-label">
                      SUPPORT TICKET
                    </span>

                    <h4 className="ticket-title">
                      {ticket.title}
                    </h4>

                    <div className="ticket-info">
                      <span>Ticket ID: {ticket.ticketId}</span>
                    </div>
                  </div>

                  <div className="ticket-meta">
                    <div className="ticket-badges">
                      <span className={`status ${ticket.status}`}>
                        {ticket.status
                          .replace("_", " ")
                          .toUpperCase()}
                      </span>

                      <span className={`priority ${ticket.priority}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="ticket-date">
                      {new Date(ticket.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}

                      <br />

                      {new Date(ticket.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <aside className="panel-card quick-actions">
          <div className="panel-header">
            <h2>Quick Actions</h2>
          </div>

          <div className="action-list">
            <button
              className="action-item"
              onClick={() => setShowCreateTicket(true)}
            >
              <FiPlus />

              <div>
                <h4>Create Ticket</h4>
                <p>Submit a new issue</p>
              </div>
            </button>

            <button
              className="action-item"
              onClick={() => navigate("/user/tickets")}
            >
              <FiFolder />

              <div>
                <h4>My Tickets</h4>
                <p>View ticket history</p>
              </div>
            </button>

            <button
              className="action-item"
              onClick={() => navigate("/user/messages")}
            >
              <FiMessageCircle />

              <div>
                <h4>Contact Support</h4>
                <p>Chat with IT team</p>
              </div>
            </button>

            <button
              className="action-item"
              onClick={() => navigate("/user/settings")}
            >
              <FiSettings />

              <div>
                <h4>Settings</h4>
                <p>Manage your account</p>
              </div>
            </button>
          </div>
        </aside>
      </div>

      {/* ANNOUNCEMENTS */}
      <section className="panel-card announcements">

        <div className="panel-header">
          <h2>Announcements</h2>
        </div>


        <div className="announcement-list">

          {announcements.length === 0 ? (

            <div className="empty-state">

              <FiBell />

              <h3>
                No announcements
              </h3>

              <p>
                There are no announcements available right now.
              </p>

            </div>

          ) : (

            announcements.map((announcement) => (

              <div
                key={announcement._id}
                className="announcement-item"
              >

                <div className="announcement-icon">

                  <FiBell />

                </div>


                <div className="announcement-content">

                  <h4>
                    {announcement.title}
                  </h4>

                  <p>
                    {announcement.content}
                  </p>


                  <span className="announcement-date">

                    {new Date(
                      announcement.createdAt
                    ).toLocaleDateString([], {

                      month:"short",

                      day:"numeric",

                      year:"numeric",

                    })}

                  </span>

                </div>


              </div>

            ))

          )}

        </div>

      </section>

      {showCreateTicket && (
        <CreateTicketModal
          onClose={() => setShowCreateTicket(false)}
          onTicketCreated={() => {
            setShowCreateTicket(false);
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
}