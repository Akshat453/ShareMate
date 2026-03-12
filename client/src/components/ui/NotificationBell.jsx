import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import './NotificationBell.css';

export default function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const { notifications, unreadCount, setNotifications, markRead, markAllRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        const items = data.data.notifications || [];
        const unread = items.filter(n => !n.isRead).length;
        setNotifications(items, unread);
      } catch (err) { /* silent */ }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    markRead(id);
    try { await api.put(`/notifications/${id}/read`); } catch (e) { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    markAllRead();
    try { await api.put('/notifications/read-all'); } catch (e) { /* silent */ }
  };

  if (!isAuthenticated) return null;

  const typeIcons = {
    event_invite: '📅', event_update: '🔔', listing_request: '📦',
    request_accepted: '✅', request_declined: '❌', chat_message: '💬',
    badge_earned: '🏅', system: '⚙️',
  };

  return (
    <div className="notif-bell" ref={dropdownRef}>
      <button className="notif-bell__btn" onClick={() => setIsOpen(!isOpen)} aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-bell__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notif-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <div className="notif-dropdown__header">
              <h4 className="notif-dropdown__title">Notifications</h4>
              {unreadCount > 0 && (
                <button className="notif-dropdown__mark-all" onClick={handleMarkAllRead}>
                  Mark all read
                </button>
              )}
            </div>

            <div className="notif-dropdown__list">
              {notifications.length === 0 ? (
                <div className="notif-dropdown__empty">
                  <span style={{ fontSize: '2rem' }}>🔔</span>
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif._id}
                    className={`notif-item ${!notif.isRead ? 'notif-item--unread' : ''}`}
                    onClick={() => handleMarkRead(notif._id)}
                  >
                    <span className="notif-item__icon">{typeIcons[notif.type] || '🔔'}</span>
                    <div className="notif-item__content">
                      <p className="notif-item__title">{notif.title}</p>
                      <p className="notif-item__body">{notif.body}</p>
                      <span className="notif-item__time">
                        {getTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    {!notif.isRead && <span className="notif-item__dot" />}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getTimeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
