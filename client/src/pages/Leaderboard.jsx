import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/users/leaderboard');
        setUsers(data.data.users);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 700 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.3rem' }}>Leaderboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2xl)' }}>Top community contributors by impact score.</p>

          {loading ? <Loader /> : (
            <motion.div variants={stagger} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {users.map((user, i) => (
                <motion.div key={user._id} variants={fadeUp} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem',
                  transition: 'border-color 0.2s',
                  borderLeftColor: i < 3 ? 'var(--accent-primary)' : 'var(--border)',
                  borderLeftWidth: i < 3 ? '3px' : '1px',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: i < 3 ? '1.5rem' : '1rem', minWidth: 36, textAlign: 'center' }}>
                    {i < 3 ? medals[i] : `#${i + 1}`}
                  </span>
                  <Avatar src={user.avatar} name={user.name} size="md" ring={i < 3} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {user.stats?.eventsJoined || 0} events
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {user.stats?.hoursVolunteered || 0}h
                      </span>
                    </div>
                  </div>
                  <Badge variant="gold" size="md">{user.stats?.impactScore || 0} pts</Badge>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
