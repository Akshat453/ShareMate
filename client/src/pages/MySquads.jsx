import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { SQUAD_CATEGORIES } from '../utils/squadCategories';
import SquadCard from '../components/ui/SquadCard';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import './MySquads.css';

const tabs = [
  { key: 'created', label: 'Created', endpoint: '/squad/my/created' },
  { key: 'joined', label: 'Joined', endpoint: '/squad/my/joined' },
  { key: 'interested', label: 'Interested', endpoint: '/squad/my/interested' },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function MySquads() {
  const [activeTab, setActiveTab] = useState('created');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const tab = tabs.find(t => t.key === activeTab);
        const { data } = await api.get(tab.endpoint);
        setPosts(data.data.posts);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [activeTab]);

  return (
    <div className="page-content">
      <div className="my-squads">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="my-squads__header">
            <div>
              <h1 className="my-squads__title">My Squads</h1>
              <p className="my-squads__subtitle">Manage your squad posts and participation.</p>
            </div>
            <Link to="/squad/create">
              <Button variant="primary">+ New Squad</Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="my-squads__tabs">
            {tabs.map(t => (
              <button
                key={t.key}
                className={`my-squads__tab ${activeTab === t.key ? 'my-squads__tab--active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? <Loader /> : posts.length === 0 ? (
            <div className="my-squads__empty">
              <span style={{ fontSize: '2.5rem' }}>
                {activeTab === 'created' ? '📝' : activeTab === 'joined' ? '🤝' : '👀'}
              </span>
              <p>No {activeTab} squad posts yet.</p>
              {activeTab === 'created' && (
                <Link to="/squad/create"><Button variant="primary">Create Your First</Button></Link>
              )}
              {activeTab !== 'created' && (
                <Link to="/squad"><Button variant="ghost">Browse Squads</Button></Link>
              )}
            </div>
          ) : (
            <motion.div className="my-squads__grid" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
              {posts.map(post => (
                <motion.div key={post._id} variants={fadeUp}>
                  <SquadCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
