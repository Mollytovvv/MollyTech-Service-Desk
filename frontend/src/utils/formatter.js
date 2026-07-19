// src/utils/formatter.js

export const formatCategory = (category) => {
  if (!category) return "N/A";

  return category
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
};

export const formatStatus = (status) => {
  switch (status) {
    case "open":
      return "Pending";

    case "in_progress":
      return "In Progress";

    case "resolved":
      return "Resolved";

    case "closed":
      return "Closed";

    default:
      return status;
  }
};

export const formatPriority = (priority) => {
  if (!priority) return "N/A";

  return priority.charAt(0).toUpperCase() +
         priority.slice(1).toLowerCase();
};

export const formatAssignedTo = (assignedTo) => {
  if (!assignedTo) return "Unassigned";

  const roles = {
    admin: "Admin",
    it_support: "IT Support",
    technician: "Technician",
  };

  return roles[assignedTo] || assignedTo;
};

export const formatDateTime = (date) => {

    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).replace(",", " •");

};

