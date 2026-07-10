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

  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [ticketRes, userRes] = await Promise.all([
          api.get("/tickets", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/auth/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTickets(ticketRes.data.tickets ?? []);
        setUsers(userRes.data.users ?? []);
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    fetchData();

    const handleNewTicket = (ticket) => {
      setTickets((prev) => [ticket, ...prev]);
    };

    socket.on("newTicket", handleNewTicket);

    return () => {
      socket.off("newTicket", handleNewTicket);
    };

  }, [token]);

  // =========================
  // ACITVITY FEED
  // =========================
  const [feedFilter, setFeedFilter] = useState("all");
  const [statsFilter, setStatsFilter] = useState("month");
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

    ticketId: `#${t._id.slice(-6)}`,

    submittedBy:
      t.submittedBy
        ? `${t.submittedBy.firstName} ${t.submittedBy.lastName}`
        : "Unknown User",

    status: t.status,

    createdAt: t.createdAt
  }));

  const recentUsers = users.slice(0, 5);

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

      <TopCards tickets={tickets} />

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

                <div className="activity-title-row">

                  <h5>
                    {activity.event}
                  </h5>

                </div>


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

                    <span className={`tag ${activity.status}`}>
                      {activity.status.toUpperCase()}
                    </span>

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
          <div className="panel-header">
            <h2>
              <FiUsers className="title-icon" />
              Recently Registered
            </h2>
            <p>Latest user signups</p>
          </div>

          <div className="stream">
            {recentUsers.length === 0 ? (
              <span className="muted">No users yet</span>
            ) : (
              recentUsers.map((u, index) => (
                <div key={u._id} className="user-item">

                  <div className="user-left">
                    <div className="user-avatar">
                    {(u.name || u.email || "U").charAt(0).toUpperCase()}
                    </div>

                    <div className="user-text">
                    <h4>{u.name}</h4>
                      <p>{u.email}</p>
                    </div>
                  </div>

                  <div className="user-meta">
                    <span className="user-badge">#{index + 1}</span>
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