import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { SQUAD_CATEGORIES } from '../utils/squadCategories';
import SquadCard from '../components/ui/SquadCard';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';
import './SquadFeed.css';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function SquadFeed() {
  const [posts, setPosts] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const categories = Object.values(SQUAD_CATEGORIES);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory) params.category = activeCategory;
      if (search) params.search = search;
      const { data } = await api.get('/squad', { params });
      setPosts(data.data.posts);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchExpiring = async () => {
    try {
      const { data } = await api.get('/squad/expiring-soon');
      setExpiring(data.data.posts);
    } catch (e) { /* silent */ }
  };

  useEffect(() => { fetchPosts(); fetchExpiring(); }, [activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleJoin = async (id) => {
    try {
      await api.post(`/squad/${id}/join`);
      fetchPosts();
    } catch (e) { alert(e.response?.data?.message || 'Failed to join'); }
  };

  const handleInterest = async (id) => {
    try {
      await api.post(`/squad/${id}/interest`);
    } catch (e) { /* silent */ }
  };

  return (
    <div className="page-content">
      <div className="squad-feed">
        {/* Hero */}
        <motion.div className="squad-feed__hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="squad-feed__title">
            Squad <span className="text-gold">Up</span>
          </h1>
          <p className="squad-feed__subtitle">
            Find people near you doing the same thing. Split costs, share rides, order together.
          </p>
          <div className="squad-feed__hero-actions">
            <Link to="/squad/create">
              <Button variant="primary" size="lg">+ Create Squad Post</Button>
            </Link>
            <Link to="/squad/my">
              <Button variant="ghost" size="lg">My Squads</Button>
            </Link>
          </div>
        </motion.div>

        {/* Category Pills */}
        <div className="squad-feed__categories">
          <button
            className={`squad-feed__pill ${!activeCategory ? 'squad-feed__pill--active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`squad-feed__pill ${activeCategory === cat.key ? 'squad-feed__pill--active' : ''}`}
              style={activeCategory === cat.key ? { borderColor: cat.color, color: cat.color } : {}}
              onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form className="squad-feed__search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search squads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="squad-feed__search-input"
          />
          <Button variant="ghost" size="sm" type="submit">Search</Button>
        </form>

        {/* Urgency Strip */}
        {expiring.length > 0 && (
          <div className="squad-feed__urgency">
            <h3 className="squad-feed__urgency-title">⚡ Closing Soon</h3>
            <div className="squad-feed__urgency-scroll">
              {expiring.map((post) => (
                <Link key={post._id} to={`/squad/${post._id}`} className="squad-feed__urgency-card">
                  <span className="squad-feed__urgency-icon">{SQUAD_CATEGORIES[post.category]?.icon || '✨'}</span>
                  <div>
                    <p className="squad-feed__urgency-name">{post.title}</p>
                    <span className="squad-feed__urgency-timer">
                      {post.actionDeadline && `${Math.max(0, Math.floor((new Date(post.actionDeadline) - Date.now()) / 60000))}m left`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {loading ? <Loader /> : (
          <motion.div className="squad-feed__grid" variants={stagger} initial="initial" animate="animate">
            {posts.length === 0 ? (
              <div className="squad-feed__empty">
                <span style={{ fontSize: '3rem' }}>🤷</span>
                <p>No squad posts yet. Be the first!</p>
                <Link to="/squad/create"><Button variant="primary">Create Squad Post</Button></Link>
              </div>
            ) : posts.map((post) => (
              <motion.div key={post._id} variants={fadeUp}>
                <SquadCard post={post} onJoin={handleJoin} onInterest={handleInterest} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
