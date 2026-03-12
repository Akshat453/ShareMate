import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Loader from '../components/ui/Loader';
import './Events.css';

const categories = ['all', 'charity', 'environment', 'health', 'education', 'community', 'sports', 'arts'];

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [activeCategory]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (search) params.search = search;
      const { data } = await api.get('/events', { params });
      setEvents(data.data.events);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="page-content">
      <div className="container">
        {/* Header */}
        <motion.div
          className="events__header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="events__title">Community Events</h1>
            <p className="events__subtitle">Discover opportunities to connect, help, and grow together.</p>
          </div>
          <Link to="/events/create" style={{ textDecoration: 'none' }}>
            <Button variant="primary">+ Create Event</Button>
          </Link>
        </motion.div>

        {/* Filters */}
        <div className="events__filters">
          <div className="events__categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`events__cat-btn ${activeCategory === cat ? 'events__cat-btn--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <form className="events__search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="events__search-input"
            />
          </form>
        </div>

        {/* Events Grid */}
        {loading ? (
          <Loader />
        ) : events.length === 0 ? (
          <div className="events__empty">
            <p>No events found. Be the first to create one!</p>
            <Link to="/events/create" style={{ textDecoration: 'none' }}>
              <Button variant="ghost">Create an Event</Button>
            </Link>
          </div>
        ) : (
          <motion.div className="events__grid" variants={stagger} initial="initial" animate="animate">
            {events.map((event, i) => (
              <motion.div key={event._id} variants={fadeUp}>
                <Link to={`/events/${event._id}`} className="events__card-link">
                  <Card className="events__card" hover>
                    <div className="events__card-image">
                      <div className="events__card-image-placeholder" style={{
                        background: `linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))`,
                      }}>
                        <span className="events__card-emoji">
                          {event.category === 'charity' ? '❤️' : event.category === 'environment' ? '🌿' :
                           event.category === 'health' ? '🏥' : event.category === 'education' ? '📚' :
                           event.category === 'sports' ? '⚽' : '🤝'}
                        </span>
                      </div>
                      <div className="events__card-overlay">
                        <span className={`card__tag card__tag--${event.category}`}>{event.category}</span>
                      </div>
                    </div>
                    <div className="card__body">
                      <h3 className="events__card-title">{event.title}</h3>
                      <div className="events__card-meta">
                        <div className="events__card-meta-item">
                          <span>📅</span> {formatDate(event.dateTime)}
                        </div>
                        <div className="events__card-meta-item">
                          <span>📍</span> {event.location?.address || 'Location TBA'}
                        </div>
                      </div>
                      <div className="events__card-footer">
                        <div className="events__card-participants">
                          <div className="avatar-stack">
                            {event.participants?.slice(0, 3).map((p, idx) => (
                              <Avatar key={idx} name={typeof p === 'object' ? p.name : ''} size="sm" />
                            ))}
                          </div>
                          <span className="events__card-count font-mono">
                            {event.participants?.length || 0}/{event.capacity}
                          </span>
                        </div>
                        {event.urgency === 'high' && <Badge variant="red">Urgent</Badge>}
                        <Button variant="primary" size="sm">Join</Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
