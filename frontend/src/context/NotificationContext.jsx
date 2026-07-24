import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

import {
  getNotifications,
  markAsRead as markNotificationRead,
  markAllAsRead as markAllNotificationsRead,
} from "../api/notificationApi";

import socket from "../socket/socket";

// ===============================
// CONTEXT
// ===============================
const NotificationContext =
  createContext();

// ===============================
// PROVIDER
// ===============================
export const NotificationProvider = ({
  children,
}) => {

  const { user } = useAuth();

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  // ===============================
  // FETCH NOTIFICATIONS
  // ===============================
  const fetchNotifications =
    async () => {

      if (!user) return;

      try {

        setLoading(true);

        const data =
          await getNotifications();

        setNotifications(
          data.notifications || []
        );

      } catch (err) {

        console.log(
          "NOTIFICATION FETCH ERROR:",
          err
        );

      } finally {

        setLoading(false);

      }

    };

  // ===============================
  // LOAD ON LOGIN
  // ===============================
  useEffect(() => {

    fetchNotifications();

  }, [user]);

  // ===============================
  // REAL-TIME SOCKET
  // ===============================
  useEffect(() => {

    if (!user) return;

    const handleNotification = (
      notification
    ) => {

      setNotifications(
        (prev) => [
          notification,
          ...prev,
        ]
      );

    };

    socket.on(
      "notificationCreated",
      handleNotification
    );

    return () => {

      socket.off(
        "notificationCreated",
        handleNotification
      );

    };

  }, [user]);

  // ===============================
  // UNREAD COUNT
  // ===============================
  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  // ===============================
  // MARK SINGLE NOTIFICATION READ
  // ===============================
  const markAsRead = async (id) => {

    try {

      await markNotificationRead(id);


      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );


    } catch(err) {

      console.log(
        "MARK NOTIFICATION READ ERROR:",
        err
      );

    }

  };

  // ===============================
  // MARK ALL READ
  // ===============================
  const markAllAsRead = async () => {

    try {

      await markAllNotificationsRead();


      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          isRead: true,
        }))
      );


    } catch(err) {

      console.log(
        "MARK ALL NOTIFICATION ERROR:",
        err
      );

    }

  };

  return (

    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >

      {children}

    </NotificationContext.Provider>

  );

};

// ===============================
// HOOK
// ===============================
export const useNotifications =
  () => useContext(NotificationContext);