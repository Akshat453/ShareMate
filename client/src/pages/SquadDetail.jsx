import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { SQUAD_CATEGORIES } from '../utils/squadCategories';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import './SquadDetail.css';

export default function SquadDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    try {
      const { data } = await api.get(`/squad/${id}`);
      setPost(data.data.post);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPost(); }, [id]);

  if (loading) return <div className="page-content"><Loader /></div>;
  if (!post) return <div className="page-content"><p style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Squad post not found.</p></div>;

  const cat = SQUAD_CATEGORIES[post.category] || SQUAD_CATEGORIES.custom;
  const isCreator = user && post.creator?._id === user._id;
  const isMember = post.currentParticipants?.some(p => p._id === user?._id);
  const spotsLeft = post.maxParticipants - (post.currentParticipants?.length || 0);
  const fillPercent = ((post.currentParticipants?.length || 0) / post.maxParticipants) * 100;
  const categoryLabel = post.category === 'custom' ? post.customCategoryLabel || 'Custom' : cat.label;

  const gapRemaining = post.category === 'order_split' && post.meta
    ? Math.max(0, (post.meta.targetThreshold || 0) - (post.meta.currentCartValue || 0)) : null;

  const handleJoin = async () => {
    try { await api.post(`/squad/${id}/join`); fetchPost(); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };
  const handleLeave = async () => {
    try { await api.delete(`/squad/${id}/leave`); fetchPost(); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };
  const handleConfirm = async () => {
    try { await api.post(`/squad/${id}/confirm`); fetchPost(); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };
  const handleComplete = async () => {
    try { await api.post(`/squad/${id}/complete`); fetchPost(); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };
  const handleCancel = async () => {
    if (!confirm('Cancel this squad post?')) return;
    try { await api.delete(`/squad/${id}`); fetchPost(); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="page-content">
      <div className="squad-detail">
        {/* Hero Banner */}
        <motion.div
          className="squad-detail__hero"
          style={{ borderColor: cat.color }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="squad-detail__hero-top">
            <span className="squad-detail__cat-pill" style={{ background: `${cat.color}20`, color: cat.color, borderColor: `${cat.color}40` }}>
              {cat.icon} {categoryLabel}
            </span>
            <Badge variant={post.status === 'confirmed' ? 'green' : post.status === 'full' ? 'gold' : post.status === 'cancelled' ? 'red' : 'default'}>
              {post.status}
            </Badge>
            {post.suggestedForCategory && <span className="squad-detail__trending">🔥 Community Favourite</span>}
          </div>
          <h1 className="squad-detail__title">{post.title}</h1>
          <div className="squad-detail__meta">
            <Avatar src={post.creator?.avatar} name={post.creator?.name || ''} size="sm" ring />
            <span>by <strong>{post.creator?.name}</strong></span>
            <span className="squad-detail__dot">·</span>
            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            {post.location?.address && (
              <><span className="squad-detail__dot">·</span> <span>📍 {post.location.address}</span></>
            )}
          </div>
        </motion.div>

        <div className="squad-detail__body">
          {/* Main Content */}
          <div className="squad-detail__main">
            {/* Description */}
            {post.description && (
              <div className="squad-detail__section">
                <h3 className="squad-detail__section-title">About</h3>
                <p className="squad-detail__desc">{post.description}</p>
              </div>
            )}

            {/* Category-specific Meta */}
            {post.meta && Object.keys(post.meta).length > 0 && (
              <div className="squad-detail__section">
                <h3 className="squad-detail__section-title">{cat.icon} Details</h3>
                <div className="squad-detail__meta-grid">
                  {Object.entries(post.meta).map(([key, val]) => (
                    val && (
                      <div key={key} className="squad-detail__meta-item">
                        <span className="squad-detail__meta-key">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                        <span className="squad-detail__meta-val">{String(val)}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Participants */}
            <div className="squad-detail__section">
              <h3 className="squad-detail__section-title">
                Squad Members ({post.currentParticipants?.length || 0}/{post.maxParticipants})
              </h3>
              <div className="squad-detail__fill-bar">
                <div className="squad-detail__fill-progress" style={{ width: `${fillPercent}%` }} />
              </div>
              <div className="squad-detail__participants">
                {post.currentParticipants?.map((p) => (
                  <div key={p._id} className="squad-detail__participant">
                    <Avatar src={p.avatar} name={p.name} size="md" ring={p._id === post.creator?._id} />
                    <span className="squad-detail__participant-name">{p.name}</span>
                    {p._id === post.creator?._id && <Badge variant="gold" size="sm">Organizer</Badge>}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {((post.tags?.length > 0) || (post.userDefinedTags?.length > 0)) && (
              <div className="squad-detail__section">
                <div className="squad-detail__tags">
                  {[...(post.tags || []), ...(post.userDefinedTags || [])].map(t => (
                    <Badge key={t} variant="default" size="sm">{t}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="squad-detail__sidebar">
            {/* Cost Card */}
            <div className="squad-detail__card">
              <h4 className="squad-detail__card-title">Cost Breakdown</h4>
              {post.totalCost ? (
                <>
                  <div className="squad-detail__cost-row"><span>Total</span><span>₹{post.totalCost}</span></div>
                  <div className="squad-detail__cost-row"><span>Participants</span><span>{post.currentParticipants?.length || 1}</span></div>
                  <div className="squad-detail__cost-row squad-detail__cost-row--highlight">
                    <span>Your Share</span>
                    <span className="text-gold" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                      ₹{post.costPerPerson || Math.ceil(post.totalCost / Math.max(post.currentParticipants?.length || 1, 1))}
                    </span>
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Free — no cost involved</p>
              )}
              {gapRemaining !== null && (
                <div className="squad-detail__gap-block">
                  <span className="squad-detail__gap-label">Order Split Gap</span>
                  <span className="squad-detail__gap-value">₹{gapRemaining} remaining</span>
                </div>
              )}
            </div>

            {/* Action Card */}
            <div className="squad-detail__card">
              {post.status === 'cancelled' || post.status === 'completed' ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>This squad is {post.status}.</p>
              ) : !isAuthenticated ? (
                <Link to="/login"><Button variant="primary" fullWidth>Sign in to Join</Button></Link>
              ) : isMember ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ color: 'var(--accent-green)', fontSize: '0.88rem', textAlign: 'center' }}>✅ You're in this squad</p>
                  {isCreator ? (
                    <>
                      {post.status === 'forming' || post.status === 'full' ? (
                        <Button variant="primary" fullWidth onClick={handleConfirm}>Confirm Squad</Button>
                      ) : null}
                      {post.status === 'confirmed' && (
                        <Button variant="primary" fullWidth onClick={handleComplete}>Mark Complete</Button>
                      )}
                      <Button variant="danger" size="sm" fullWidth onClick={handleCancel}>Cancel Post</Button>
                    </>
                  ) : (
                    <Button variant="ghost" fullWidth onClick={handleLeave}>Leave Squad</Button>
                  )}
                </div>
              ) : spotsLeft > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Button variant="primary" fullWidth size="lg" onClick={handleJoin}>Squad Up</Button>
                  <span style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                  </span>
                </div>
              ) : (
                <Button variant="ghost" fullWidth disabled>Squad Full</Button>
              )}
            </div>

            {/* Deadline */}
            {post.actionDeadline && (
              <div className="squad-detail__card">
                <h4 className="squad-detail__card-title">⏱ Deadline</h4>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                  {new Date(post.actionDeadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
