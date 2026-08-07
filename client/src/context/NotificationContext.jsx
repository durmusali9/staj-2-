import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { notificationAPI } from '../services/api';
import NotificationToast from '../components/NotificationToast';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.okundu).length;
      setUnreadCount(unread);
    } catch (err) {
      // Sessizce hata yut — bildirimler kritik değil
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  const showToast = (mesaj, tip = 'ai_analiz') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, mesaj, tip }]);
  };

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, okundu: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, okundu: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, showToast, markAsRead, markAllAsRead, fetchNotifications
    }}>
      {children}
      <NotificationToast toasts={toasts} removeToast={removeToast} />
    </NotificationContext.Provider>
  );
};
