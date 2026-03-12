import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/events', { params: { limit: 6 } });
        setEvents(data.data.events);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const stats = user?.stats || {};

  return (
    <div className="page-content">
      <div className="dashboard">
        {/* Sidebar */}
        <motion.aside
          className="dashboard__sidebar"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="dashboard__profile-card">
            <Avatar src={user?.avatar} name={user?.name || ''} size="xl" ring />
            <h3 className="dashboard__user-name">{user?.name}</h3>
            <p className="dashboard__user-email">{user?.email}</p>
            <Badge variant="gold" size="md">{user?.role || 'Member'}</Badge>
          </div>

          {/* Stats */}
          <div className="dashboard__stats">
            <div className="dashboard__stat">
              <div className="dashboard__stat-ring" style={{ '--progress': `${Math.min((stats.eventsJoined || 0) * 10, 100)}%` }}>
                <span className="dashboard__stat-value">{stats.eventsJoined || 0}</span>
              </div>
              <span className="dashboard__stat-label">Events Joined</span>
            </div>
            <div className="dashboard__stat">
              <div className="dashboard__stat-ring" style={{ '--progress': `${Math.min((stats.hoursVolunteered || 0) * 2, 100)}%` }}>
                <span className="dashboard__stat-value">{stats.hoursVolunteered || 0}</span>
              </div>
              <span className="dashboard__stat-label">Hours</span>
            </div>
            <div className="dashboard__stat">
              <div className="dashboard__stat-ring" style={{ '--progress': `${Math.min((stats.impactScore || 0), 100)}%` }}>
                <span className="dashboard__stat-value">{stats.impactScore || 0}</span>
              </div>
              <span className="dashboard__stat-label">Impact</span>
            </div>
          </div>

          <nav className="dashboard__nav">
            <Link to="/dashboard" className="dashboard__nav-link dashboard__nav-link--active">Dashboard</Link>
            <Link to="/events" className="dashboard__nav-link">My Events</Link>
            <Link to="/listings" className="dashboard__nav-link">My Listings</Link>
            <Link to="/chat" className="dashboard__nav-link">Messages</Link>
            <Link to="/profile" className="dashboard__nav-link">Profile</Link>
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="dashboard__main">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <h1 className="dashboard__title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="dashboard__subtitle">Here's what's happening in your community.</p>

            {/* Quick Actions */}
            <div className="dashboard__actions">
              <Link to="/events/create" style={{ textDecoration: 'none' }}>
                <Card className="dashboard__action-card" hover>
                  <div className="card__body" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>📅</span>
                    <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>Create Event</p>
                  </div>
                </Card>
              </Link>
              <Link to="/listings/create" style={{ textDecoration: 'none' }}>
                <Card className="dashboard__action-card" hover>
                  <div className="card__body" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>📦</span>
                    <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>New Listing</p>
                  </div>
                </Card>
              </Link>
              <Link to="/map" style={{ textDecoration: 'none' }}>
                <Card className="dashboard__action-card" hover>
                  <div className="card__body" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>🗺️</span>
                    <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>Explore Map</p>
                  </div>
                </Card>
              </Link>
            </div>

            {/* Upcoming Events */}
            <h2 className="dashboard__section-title">Upcoming Events</h2>
            {loading ? <Loader /> : events.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No upcoming events. <Link to="/events">Browse events</Link></p>
            ) : (
              <div className="dashboard__events-list">
                {events.map((event) => (
                  <Link to={`/events/${event._id}`} key={event._id} style={{ textDecoration: 'none' }}>
                    <Card className="dashboard__event-item" hover>
                      <div className="card__body" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                        <div className="dashboard__event-date">
                          <span className="dashboard__event-month">{new Date(event.dateTime).toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="dashboard__event-day">{new Date(event.dateTime).getDate()}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>{event.title}</h4>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{event.location?.address || 'TBA'}</p>
                        </div>
                        <span className={`card__tag card__tag--${event.category}`}>{event.category}</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
