import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Loader from '../components/ui/Loader';
import './EventDetail.css';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => { fetchEvent(); }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.data.event);
    } catch (err) { navigate('/events'); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) return navigate('/login');
    setJoining(true);
    try {
      await api.post(`/events/${id}/join`);
      fetchEvent();
    } catch (err) { alert(err.response?.data?.message || 'Failed to join'); }
    finally { setJoining(false); }
  };

  const handleLeave = async () => {
    try {
      await api.delete(`/events/${id}/leave`);
      fetchEvent();
    } catch (err) { alert('Failed to leave event'); }
  };

  if (loading) return <div className="page-content"><Loader /></div>;
  if (!event) return null;

  const isParticipant = user && event.participants?.some(p => (p._id || p) === user._id);
  const isOrganizer = user && (event.organizer?._id || event.organizer) === user._id;

  return (
    <div className="page-content">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Breadcrumb */}
          <div className="event-detail__breadcrumb">
            <Link to="/events">← Back to Events</Link>
          </div>

          <div className="event-detail__layout">
            {/* Main Content */}
            <div className="event-detail__main">
              {/* Hero Image */}
              <div className="event-detail__hero">
                <div className="event-detail__hero-gradient" />
                <span className={`card__tag card__tag--${event.category}`}>{event.category}</span>
                {event.urgency === 'high' && <Badge variant="red" size="md">Urgent</Badge>}
              </div>

              <h1 className="event-detail__title">{event.title}</h1>

              <div className="event-detail__organizer">
                <Avatar src={event.organizer?.avatar} name={event.organizer?.name || ''} size="md" ring />
                <div>
                  <p className="event-detail__organizer-name">{event.organizer?.name}</p>
                  <p className="event-detail__organizer-role">Organizer</p>
                </div>
              </div>

              <div className="event-detail__description">
                <h3>About This Event</h3>
                <p>{event.description}</p>
              </div>

              {/* Resources */}
              {event.resources?.length > 0 && (
                <div className="event-detail__resources">
                  <h3>Resources Needed</h3>
                  <div className="event-detail__resource-list">
                    {event.resources.map((r, i) => (
                      <div key={i} className="event-detail__resource-item">
                        <span>{r.name}</span>
                        <Badge variant="default">{r.quantity} {r.unit}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Participants */}
              <div className="event-detail__participants">
                <h3>Participants ({event.participants?.length || 0}/{event.capacity})</h3>
                <div className="event-detail__participant-grid">
                  {event.participants?.map((p, i) => (
                    <div key={i} className="event-detail__participant">
                      <Avatar src={p.avatar} name={p.name || ''} size="md" />
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="event-detail__sidebar">
              <div className="event-detail__info-card">
                <div className="event-detail__info-item">
                  <span className="event-detail__info-icon">📅</span>
                  <div>
                    <p className="event-detail__info-label">Date & Time</p>
                    <p className="event-detail__info-value">
                      {new Date(event.dateTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="event-detail__info-sub">
                      {new Date(event.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                       · {event.duration} min
                    </p>
                  </div>
                </div>

                <div className="event-detail__info-item">
                  <span className="event-detail__info-icon">📍</span>
                  <div>
                    <p className="event-detail__info-label">Location</p>
                    <p className="event-detail__info-value">{event.location?.address || 'TBA'}</p>
                  </div>
                </div>

                <div className="event-detail__info-item">
                  <span className="event-detail__info-icon">👥</span>
                  <div>
                    <p className="event-detail__info-label">Capacity</p>
                    <p className="event-detail__info-value">{event.participants?.length || 0} / {event.capacity} participants</p>
                  </div>
                </div>

                {/* Tags */}
                {event.tags?.length > 0 && (
                  <div className="event-detail__tags">
                    {event.tags.map((tag, i) => (
                      <Badge key={i} variant="default" size="sm">#{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="event-detail__actions">
                  {isOrganizer ? (
                    <Link to={`/events/${event._id}/edit`} style={{ textDecoration: 'none', width: '100%' }}>
                      <Button variant="secondary" fullWidth>Edit Event</Button>
                    </Link>
                  ) : isParticipant ? (
                    <Button variant="ghost" fullWidth onClick={handleLeave}>Leave Event</Button>
                  ) : (
                    <Button variant="primary" fullWidth size="lg" onClick={handleJoin} loading={joining}>
                      Join Event
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
