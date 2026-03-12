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

const typeEmoji = { share: '🔄', give: '🎁', take: '🙏' };
const typeColors = { share: 'blue', give: 'green', take: 'gold' };

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestMsg, setRequestMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => { fetchListing(); }, [id]);

  const fetchListing = async () => {
    try {
      const { data } = await api.get(`/listings/${id}`);
      setListing(data.data.listing);
    } catch (err) { navigate('/listings'); }
    finally { setLoading(false); }
  };

  const handleRequest = async () => {
    if (!isAuthenticated) return navigate('/login');
    setSending(true);
    try {
      await api.post(`/listings/${id}/request`, { message: requestMsg });
      setRequestMsg('');
      fetchListing();
    } catch (err) { alert(err.response?.data?.message || 'Failed to send request'); }
    finally { setSending(false); }
  };

  const handleRequestAction = async (reqId, status) => {
    try {
      await api.put(`/listings/${id}/request/${reqId}`, { status });
      fetchListing();
    } catch (err) { alert('Failed'); }
  };

  if (loading) return <div className="page-content"><Loader /></div>;
  if (!listing) return null;

  const isOwner = user && (listing.owner?._id || listing.owner) === user._id;
  const hasRequested = user && listing.requests?.some(r => (r.user?._id || r.user) === user._id);

  return (
    <div className="page-content">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="event-detail__breadcrumb">
            <Link to="/listings">← Back to Listings</Link>
          </div>
          <div className="event-detail__layout">
            <div className="event-detail__main">
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--space-lg)' }}>
                <Badge variant={typeColors[listing.type]} size="md">{typeEmoji[listing.type]} {listing.type}</Badge>
                <Badge variant="default" size="md">{listing.category}</Badge>
                <Badge variant={listing.status === 'available' ? 'green' : 'red'} size="md">{listing.status}</Badge>
              </div>
              <h1 className="event-detail__title">{listing.title}</h1>
              <div className="event-detail__organizer">
                <Avatar src={listing.owner?.avatar} name={listing.owner?.name || ''} size="md" ring />
                <div>
                  <p className="event-detail__organizer-name">{listing.owner?.name}</p>
                  <p className="event-detail__organizer-role">Owner</p>
                </div>
              </div>
              <div className="event-detail__description">
                <h3>Description</h3>
                <p>{listing.description}</p>
              </div>

              {/* Requests (only visible to owner) */}
              {isOwner && listing.requests?.length > 0 && (
                <div className="event-detail__participants">
                  <h3>Requests ({listing.requests.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {listing.requests.map((req) => (
                      <div key={req._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Avatar src={req.user?.avatar} name={req.user?.name || ''} size="sm" />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{req.user?.name}</p>
                            {req.message && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{req.message}</p>}
                          </div>
                        </div>
                        {req.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button size="sm" variant="primary" onClick={() => handleRequestAction(req._id, 'accepted')}>Accept</Button>
                            <Button size="sm" variant="danger" onClick={() => handleRequestAction(req._id, 'declined')}>Decline</Button>
                          </div>
                        ) : (
                          <Badge variant={req.status === 'accepted' ? 'green' : 'red'}>{req.status}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="event-detail__sidebar">
              <div className="event-detail__info-card">
                <div className="event-detail__info-item">
                  <span className="event-detail__info-icon">📍</span>
                  <div>
                    <p className="event-detail__info-label">Location</p>
                    <p className="event-detail__info-value">{listing.location?.address || 'Local'}</p>
                  </div>
                </div>
                <div className="event-detail__info-item">
                  <span className="event-detail__info-icon">📦</span>
                  <div>
                    <p className="event-detail__info-label">Status</p>
                    <p className="event-detail__info-value">{listing.status}</p>
                  </div>
                </div>
                {!isOwner && !hasRequested && listing.status === 'available' && (
                  <div>
                    <textarea
                      placeholder="Add a message (optional)..."
                      value={requestMsg}
                      onChange={(e) => setRequestMsg(e.target.value)}
                      className="create-form__textarea"
                      rows={3}
                      style={{ marginBottom: '0.75rem' }}
                    />
                    <Button variant="primary" fullWidth onClick={handleRequest} loading={sending}>
                      Send Request
                    </Button>
                  </div>
                )}
                {hasRequested && <p style={{ textAlign: 'center', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>✓ Request sent</p>}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
