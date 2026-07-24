import api from "./axios";

// ===============================
// 🔔 GET NOTIFICATIONS
// ===============================
export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

// ===============================
// ✅ MARK AS READ
// ===============================
export const markAsRead = async (notificationId) => {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

// ===============================
// ✅ MARK ALL AS READ
// ===============================
export const markAllAsRead = async () => {
  const response = await api.patch(
    "/notifications/read-all"
  );

  return response.data;
};

// ===============================
// 🗑 DELETE NOTIFICATION
// ===============================
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(
    `/notifications/${notificationId}`
  );

  return response.data;
};