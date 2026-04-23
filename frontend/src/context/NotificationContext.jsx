import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}