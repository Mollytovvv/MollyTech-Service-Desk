import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";
import TopCards from "../components/TopCards";
import { FiActivity, FiUsers, FiBarChart2 } from "react-icons/fi";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

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
          api.get("/users", {
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
  }, [token]);

  // =========================
  // DERIVED DATA
  // =========================
  const openTickets = tickets.filter(
  (t) => t.status === "pending"
  ).length;
  const recentTickets = tickets.slice(0, 8);
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

  return (
    <div className="dashboard">

      <TopCards tickets={tickets} />

      {/* MAIN WORKSPACE */}
      <div className="workspace">

        {/* LEFT */}
        <section className="work-area">
          <div className="panel-header">
            <h2>
              <FiActivity className="title-icon" />
              Live Ticket Stream
            </h2>
            <p>Real-time service desk activity</p>
          </div>

          <div className="stream">
            {recentTickets.length === 0 ? (
              <span className="muted">No ticket activity yet</span>
            ) : (
              recentTickets.map((t, index) => (
                <div key={t._id} className="stream-item">

                  <div className="stream-left">
                    <div className={`indicator ${t.status}`}></div>

                    <div className="stream-text">
                      <h4>{t.title}</h4>
                      <p>{t.description}</p>
                    </div>
                  </div>

                  <div className="stream-right">
                    <span className={`tag ${t.status}`}>
                      {t.status}
                    </span>
                    <span className="time">#{index + 1}</span>
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
        <div className="panel-header">
          <h2>
            <FiBarChart2 className="title-icon" />
            Ticket Statistics
          </h2>
          <p>System activity overview over time</p>
        </div>

        <div className="chart-wrapper">

          <div className="chart-box">
            {chartData.length === 0 ? (
              <span className="muted">No data available yet</span>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="tickets"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
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