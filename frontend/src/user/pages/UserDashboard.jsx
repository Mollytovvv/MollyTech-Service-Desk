import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import UserTopCards from "../components/UserTopCards";

import "../styles/UserDashboard.css";

import {
  FiPlus,
  FiFolder,
  FiMessageCircle,
  FiBell,
  FiSettings
} from "react-icons/fi";

export default function UserDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({

  stats:{
    total:0,
    pending:0,
    messages:0,
    resolved:0
  },

    recentTickets:[]

  });

  const [loading, setLoading] = useState(true);
  useEffect(()=>{

    if(!token) return;

    const fetchDashboard = async()=>{

      try{


        const res = await api.get(
          "/tickets/my/dashboard",
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
          }
        );

        setDashboard(res.data);

      }catch(err){


        console.log(
          err.response?.data || err.message
        );


      }finally{


        setLoading(false);


      }


    };

    fetchDashboard();

  },[token]);

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


          <p>
            How can we assist you today?
          </p>


        </div>

      </section>

      <UserTopCards
        stats={dashboard.stats}
      />

      {/* RECENT TICKETS + QUICK ACTIONS */}

      <section className="dashboard-content">

        {/* RECENT TICKETS */}

        <div className="panel-card">

          <div className="panel-header">

            <h2>
              Recent Tickets
            </h2>

            <button

              type="button"

              className="view-all-btn"

              onClick={()=>navigate("/user/tickets")}

            >

              View All

            </button>

          </div>

          <div className="ticket-list">

            {
              dashboard.recentTickets?.length === 0 ? (


                <div className="empty-state">


                  <h3>
                    No tickets yet
                  </h3>


                  <p>
                    Create your first support ticket to get assistance from IT.
                  </p>

                </div>

              ) : (

                dashboard.recentTickets?.map(ticket=>(

                <div
                    key={ticket._id}
                    className="ticket-row"
                >

                    <div className="ticket-icon">
                        🎫
                    </div>

                    <div className="ticket-content">

                        <span className="ticket-label">
                            SUPPORT TICKET
                        </span>

                        <h4 className="ticket-title">
                            {ticket.title}
                        </h4>

                        <div className="ticket-info">
                            <i className="fa-solid fa-ticket"></i>
                            <span>Ticket ID: {ticket.ticketId}</span>
                        </div>

                    </div>

                    <div className="ticket-meta">

                        <div className="ticket-badges">

                            <span className={`status ${ticket.status}`}>
                                {ticket.status.replace("_", " ").toUpperCase()}
                            </span>

                            <span className={`priority ${ticket.priority}`}>
                                {ticket.priority.toUpperCase()}
                            </span>

                        </div>

                        <div className="ticket-date">

                            {new Date(ticket.createdAt).toLocaleDateString([],{
                                month:"short",
                                day:"numeric",
                                year:"numeric",
                            })}

                            <br/>

                            {new Date(ticket.createdAt).toLocaleTimeString([],{
                                hour:"2-digit",
                                minute:"2-digit",
                            })}

                        </div>

                    </div>

                </div>

                ))

              )
            }

          </div>

        </div>
        {/* QUICK ACTIONS */}

        <div className="panel-card quick-actions">

          <div className="panel-header">

            <h2>
              Quick Actions
            </h2>

          </div>

          <div className="action-list">

            <button

              type="button"

              className="action-item"

              onClick={()=>navigate("/user/create-ticket")}

            >

              <FiPlus/>

              <div>

                <h4>
                  Create Ticket
                </h4>

                <p>
                  Submit a new issue
                </p>

              </div>

            </button>

            <button

              type="button"

              className="action-item"

              onClick={()=>navigate("/user/tickets")}

            >

              <FiFolder/>

              <div>

                <h4>
                  My Tickets
                </h4>

                <p>
                  View ticket history
                </p>

              </div>

            </button>

            <button

              type="button"

              className="action-item"

            >

              <FiMessageCircle/>

              <div>

                <h4>
                  Contact Support
                </h4>

                <p>
                  Chat with IT team
                </p>

              </div>

            </button>

            <button

              type="button"

              className="action-item"

            >

              <FiSettings/>

              <div>

                <h4>
                  Settings
                </h4>

                <p>
                 Manage your account
                </p>

              </div>

            </button>

          </div>

        </div>

      </section>

      {/* ANNOUNCEMENTS */}

      <section className="panel-card announcements">

        <div className="panel-header">

          <h2>
            Announcements
          </h2>

        </div>

        <div className="announcement-item">

          <FiBell/>

          <div>

            <h4>
              System Maintenance
            </h4>


            <p>
              Scheduled maintenance updates will appear here.
            </p>

          </div>

        </div>

      </section>

    </div>

  );


}