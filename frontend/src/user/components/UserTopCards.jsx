import {
  FaTicketAlt,
  FaClock,
  FaComments,
  FaCheckCircle
} from "react-icons/fa";

import "../styles/UserTopCards.css";

export default function UserTopCards({ stats }) {
  const cards = [
    {
      title: "Total Tickets",
      value: stats.total,
      icon: <FaTicketAlt />,
      type: "tickets",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: <FaClock />,
      type: "pending",
    },
    {
      title: "Messages",
      value: stats.messages ?? 0,
      icon: <FaComments />,
      type: "messages",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: <FaCheckCircle />,
      type: "resolved",
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card, index) => (
        <div key={index} className="kpi-card">

          <div className={`kpi-icon ${card.type}`}>
            {card.icon}
          </div>

          <div className="kpi-content">
            <p>{card.title}</p>
            <h2>{card.value}</h2>
          </div>

        </div>
      ))}
    </div>
  );
}