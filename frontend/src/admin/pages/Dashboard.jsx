import { useEffect, useState } from "react";
import api from "../../api/axios";
import socket from "../../socket/socket";
import { useAuth } from "../../context/AuthContext";
import "../styles/Dashboard.css";
import TopCards from "../components/TopCards";
import { FiActivity, FiUsers, FiBarChart2 } from "react-icons/fi";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

// =========================
// CUSTOM TOOLTIP
// =========================
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "10px",
          padding: "10px 14px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
        }}
      >
        <p
          style={{
            color: "#e5e7eb",
            margin: 0,
            fontWeight: 600,
          }}
        >
          {label}
        </p>

        <p
          style={{
            color: "#3b82f6",
            margin: "6px 0 0",
            fontSize: "13px",
          }}
        >
          🎫 Tickets: {payload[0].value}
        </p>
      </div>
    );
  }

  return null;
};

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);

  const { token, user } = useAuth();

  useEffect(() => {
    if (!token) return;

  const fetchData = async () => {
    try {

      const ticketRes = await api.get("/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      setTickets(
        ticketRes.data.tickets ?? []
      );

    // =========================
    // 👥 USERS DATA
    // =========================

    if(user?.role === "admin"){

    const userRes = await api.get("/auth/users", {
      headers:{
        Authorization:`Bearer ${token}`
      }
    });

    setUsers(
      userRes.data.users ?? []
    );

    }

    else if(
    user?.role === "technician" ||
    user?.role === "support"
    ){

    const userRes = await api.get("/dashboard/staff-recent-users",{
      headers:{
        Authorization:`Bearer ${token}`
      }
    });

    setUsers(
      userRes.data.users ?? []
    );

    }

    else{

    setUsers([]);

    }


    } catch (err) {

      console.log(
        err.response?.data || err.message
      );

    }
  };

    const handleNewTicket = (ticket) => {
        setTickets((prev) => [ticket, ...prev]);
    };

    const handleTicketUpdated = (updatedTicket) => {

        console.log(
            "🟢 Ticket Update Received:",
            updatedTicket
        );


        if(!updatedTicket) return;


        setTickets((prev)=>{

            const exists = prev.some(
                t => t._id === updatedTicket._id
            );


            // =========================
            // EXISTING TICKET
            // =========================
            if(exists){

                return prev.map((ticket)=>{

                    if(ticket._id === updatedTicket._id){

                        return updatedTicket;

                    }

                    return ticket;

                });

            }



            // =========================
            // TECHNICIAN / SUPPORT
            // ONLY SHOW ASSIGNED
            // =========================
            if(
                user?.role === "technician" ||
                user?.role === "support"
            ){


                const assignedId =
                    updatedTicket.assignedTo?._id ||
                    updatedTicket.assignedTo;



                const currentUserId =
                    user._id ||
                    user.id;



                if(
                    assignedId &&
                    assignedId.toString() === currentUserId.toString()
                ){

                    console.log(
                        "🔥 Assigned ticket added"
                    );


                    return [
                        updatedTicket,
                        ...prev
                    ];

                }



                return prev;

            }



            // =========================
            // ADMIN
            // =========================
            return [
                updatedTicket,
                ...prev
            ];

        });

    };

    const handleNewUser = (newUser) => {


        if(user?.role !== "admin"){
            return;
        }


        setUsers((prev)=>{

            const exists = prev.some(
                existing =>
                existing._id === newUser._id
            );


            if(exists){
                return prev;
            }


            return [
                newUser,
                ...prev
            ];

        });

    };

    const handleUserUpdated = (updatedUser) => {
        setUsers((prev) =>
            prev.map((user) =>
                user._id === updatedUser._id
                    ? updatedUser
                    : user
            )
        );
    };

    const handleAssignedTicket = (ticket)=>{

        console.log(
            "🔥 Assigned Ticket Received:",
            ticket
        );


        setTickets((prev)=>{


            const exists = prev.some(
                t => t._id === ticket._id
            );


            // =========================
            // UPDATE EXISTING TICKET
            // =========================
            if(exists){

                return prev.map(t =>
                    t._id === ticket._id
                        ? ticket
                        : t
                );

            }


            // =========================
            // ADD NEW ASSIGNED TICKET
            // =========================
            return [
                ticket,
                ...prev
            ];


        });

    };


    socket.on("newTicket", handleNewTicket);

    socket.on(
        "ticketUpdated",
        handleTicketUpdated
    );


    socket.on(
        "assignedTicket",
        handleAssignedTicket
    );


    socket.on("newUser", handleNewUser);

    socket.on(
        "userUpdated",
        handleUserUpdated
    );

    fetchData();

    return () => {

    socket.off(
        "newTicket",
        handleNewTicket
    );


    socket.off(
        "ticketUpdated",
        handleTicketUpdated
    );


    socket.off(
        "assignedTicket",
        handleAssignedTicket
    );


    socket.off(
        "newUser",
        handleNewUser
    );


    socket.off(
        "userUpdated",
        handleUserUpdated
    );

    };

  }, [token, user]);


  // =========================
  // ACITVITY FEED
  // =========================
  const [feedFilter, setFeedFilter] = useState("all");
  const [statsFilter, setStatsFilter] = useState("month");
  const [userFilter, setUserFilter] = useState("all");
  const now = new Date();

  const filteredTickets = tickets.filter((t) => {
    const created = new Date(t.createdAt);

    switch (feedFilter) {
      case "all":
        return true;

      case "today":
        return created.toDateString() === now.toDateString();

      case "week": {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return created >= weekAgo;
      }

      case "month":
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );

      case "year":
        return created.getFullYear() === now.getFullYear();

      default:
        return true;
    }
  });

  const activityFeed = filteredTickets.slice(0, 8).map((t) => ({
    id: t._id,

    event:
      t.status === "resolved"
        ? "Ticket Resolved"
        : "New Ticket",

    title: t.title || "Untitled Ticket",

    ticketId: t.ticketId,

    submittedBy:
      t.submittedBy
        ? `${t.submittedBy.firstName} ${t.submittedBy.lastName}`
        : "Unknown User",

    status: t.status,
    priority: t.priority,

    createdAt: t.createdAt,
  }));

  const recentUsers = users
    .filter((u) => {

      // only admin needs role filtering
      if(user?.role === "admin"){
        
        if(u.role !== "user") {
          return false;
        }

      }


      if (userFilter === "all") {
        return true;
      }


      if (userFilter === "approved"){
        return u.status === "approved";
      }


      if (userFilter === "pending"){
        return u.status === "pending";
      }


      return true;

    })
    .slice(0,5);

  const getMonthlyStats = () => {
    const stats = {};

    tickets.forEach((t) => {
      if (!t?.createdAt) return;

    const date = new Date(t.createdAt);
    if (isNaN(date)) return;

      const month = date.toLocaleString("default", { month: "short" });

      stats[month] = (stats[month] || 0) + 1;
    });

    return Object.entries(stats).map(([month, tickets]) => ({
      month,
      tickets
    }));
  };


  const chartData = getMonthlyStats();

  
  console.log("Chart Data:", chartData);

  return (
    <div className="dashboard">

    <TopCards

        tickets={tickets}

        users={users}

        user={user}

        totalUsers={
            users.filter(
                u =>
                    u.role === "user"
            ).length
        }

    />

      {/* MAIN WORKSPACE */}
      <div className="workspace">

        {/* LEFT */}
        <section className="work-area">
        <div className="panel-header panel-header-row">

          <div>
            <h2>
              <FiActivity className="title-icon" />
              Live Operations Feed
            </h2>

            <p>Real-time service desk activity</p>
          </div>

          <div className="feed-filter">

            <button
              className={feedFilter === "all" ? "active" : ""}
              onClick={() => setFeedFilter("all")}
            >
              All
            </button>

            <button
              className={feedFilter === "today" ? "active" : ""}
              onClick={() => setFeedFilter("today")}
            >
              Today
            </button>

            <button
              className={feedFilter === "week" ? "active" : ""}
              onClick={() => setFeedFilter("week")}
            >
              Week
            </button>

            <button
              className={feedFilter === "month" ? "active" : ""}
              onClick={() => setFeedFilter("month")}
            >
              Month
            </button>

            <button
              className={feedFilter === "year" ? "active" : ""}
              onClick={() => setFeedFilter("year")}
            >
              Year
            </button>

          </div>

        </div>

          <div className="stream">

            {activityFeed.length === 0 ? (
              <span className="muted">
                No activity yet
              </span>
            ) : (

              activityFeed.map((activity) => (

                <div 
                  key={activity.id} 
                  className="activity-item"
                >

                <div className="activity-icon">
                  🎫
                </div>

                <div className="activity-content">

                <p className="activity-label">
                    {activity.event}
                </p>


                <h4 className="activity-ticket-title">
                  {activity.title}
                </h4>


                <p className="ticket-info">
                  Ticket ID: {activity.ticketId}
                </p>


                <span className="submitted">
                  Submitted By: {activity.submittedBy}
                </span>

                </div>

                  <div className="activity-meta">

                  <div className="activity-badges">

                    <span className={`tag ${activity.status}`}>
                      {activity.status.replace("_", " ").toUpperCase()}
                    </span>

                    <span className={`priority-tag ${activity.priority}`}>
                      {activity.priority.toUpperCase()}
                    </span>

                  </div>

                    {(() => {
                      const created = new Date(activity.createdAt);
                      const today = new Date();

                      const isToday =
                        created.toDateString() === today.toDateString();

                      return (
                        <small>
                          {isToday
                            ? "Today"
                            : created.toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                          <br />
                          {created.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      );
                    })()}

                  </div>

                </div>

              ))

            )}

          </div>
        </section>

        {/* RIGHT */}
        <aside className="panel-card">

        <div className="panel-header panel-header-row">

          <div>
            <h2>
              <FiUsers className="title-icon" />
              Recently Registered
            </h2>

            <p>Newest registered accounts</p>
          </div>

          <div className="user-filter">

            <button
              className={userFilter === "all" ? "active" : ""}
              onClick={() => setUserFilter("all")}
            >
              All
            </button>

            <button
              className={userFilter === "approved" ? "active" : ""}
              onClick={() => setUserFilter("approved")}
            >
              Approved
            </button>

            <button
              className={userFilter === "pending" ? "active" : ""}
              onClick={() => setUserFilter("pending")}
            >
              Pending
            </button>

          </div>

        </div>

          <div className="stream">
            {recentUsers.length === 0 ? (
              <span className="muted">No users yet</span>
            ) : (
              recentUsers.map((u, index) => (
                <div
                  key={u._id}
                  className="user-item"
                >
                  <div className="user-left">

                    <div className="user-avatar">
                      {(u.firstName || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="user-text">

                      <h4>
                        {u.firstName} {u.lastName}
                      </h4>

                      <span className="user-email">
                        {u.email}
                      </span>

                      <span className="user-date">
                        Joined{" "}
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>

                    </div>

                  </div>

                  <div className="user-right">

                  <span
                    className={`user-status ${
                      u.status === "approved"
                        ? "approved"
                        : "pending"
                    }`}
                  >
                    {u.status === "approved"
                      ? "APPROVED"
                      : "PENDING"}
                  </span>

                    <span className="user-badge">
                      #{index + 1}
                    </span>

                  </div>

                </div>
              ))
            )}
          </div>

        </aside>

        </div>

      {/* ANALYTICS */}
      <section className="analytics">
      <div className="panel-header panel-header-row">

        <div>
          <h2>
            <FiBarChart2 className="title-icon" />
            Ticket Statistics
          </h2>

          <p>System activity overview over time</p>
        </div>

        <div className="stats-filter">

          <button
            className={statsFilter === "today" ? "active" : ""}
            onClick={() => setStatsFilter("today")}
          >
            Today
          </button>

          <button
            className={statsFilter === "week" ? "active" : ""}
            onClick={() => setStatsFilter("week")}
          >
            Week
          </button>

          <button
            className={statsFilter === "month" ? "active" : ""}
            onClick={() => setStatsFilter("month")}
          >
            Month
          </button>

          <button
            className={statsFilter === "year" ? "active" : ""}
            onClick={() => setStatsFilter("year")}
          >
            Year
          </button>

        </div>

      </div>

        <div className="chart-wrapper">

          <div className="chart-box">
            {chartData.length === 0 ? (
              <span className="muted">No data available yet</span>
            ) : (

              <ResponsiveContainer width="100%" height={260}>

              <LineChart data={chartData}>

                <defs>
                  <linearGradient
                    id="ticketGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#3b82f6"
                      stopOpacity={0.35}
                    />

                    <stop
                      offset="95%"
                      stopColor="#3b82f6"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                  <CartesianGrid
                    stroke="rgba(148,163,184,0.10)"
                    strokeDasharray="3 3"
                    vertical={true}
                    horizontal={true}
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  
                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="tickets"
                    stroke="none"
                    fill="url(#ticketGradient)"
                  />

                  <Line
                    type="natural"
                    dataKey="tickets"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    strokeLinecap="round"
                    dot={{
                      r: 5,
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 8,
                      stroke: "#ffffff",
                      strokeWidth: 3,
                    }}
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationEasing="ease-in-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}