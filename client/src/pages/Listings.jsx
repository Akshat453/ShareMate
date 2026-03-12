import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Loader from '../components/ui/Loader';
import './Listings.css';

const types = ['all', 'share', 'give', 'take'];
const categories = ['all', 'tools', 'electronics', 'furniture', 'clothing', 'food', 'books', 'services'];

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const typeColors = { share: 'blue', give: 'green', take: 'gold' };
const typeEmoji = { share: '🔄', give: '🎁', take: '🙏' };

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => { fetchListings(); }, [activeType, activeCategory]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeType !== 'all') params.type = activeType;
      if (activeCategory !== 'all') params.category = activeCategory;
      const { data } = await api.get('/listings', { params });
      setListings(data.data.listings);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-content">
      <div className="container">
        <motion.div className="listings__header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="listings__title">Give & Take</h1>
            <p className="listings__subtitle">Share resources, give items away, or request what you need.</p>
          </div>
          <Link to="/listings/create" style={{ textDecoration: 'none' }}>
            <Button variant="primary">+ New Listing</Button>
          </Link>
        </motion.div>

        {/* Type Tabs */}
        <div className="listings__tabs">
          {types.map((t) => (
            <button
              key={t}
              className={`listings__tab ${activeType === t ? 'listings__tab--active' : ''}`}
              onClick={() => setActiveType(t)}
            >
              {t !== 'all' && <span>{typeEmoji[t]}</span>}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div className="listings__categories">
          {categories.map((c) => (
            <button
              key={c}
              className={`events__cat-btn ${activeCategory === c ? 'events__cat-btn--active' : ''}`}
              onClick={() => setActiveCategory(c)}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <Loader /> : listings.length === 0 ? (
          <div className="events__empty">
            <p>No listings found. Create the first one!</p>
          </div>
        ) : (
          <motion.div className="listings__grid" variants={stagger} initial="initial" animate="animate">
            {listings.map((listing) => (
              <motion.div key={listing._id} variants={fadeUp}>
                <Link to={`/listings/${listing._id}`} className="events__card-link">
                  <Card className="listings__card" hover>
                    <div className="card__body">
                      <div className="listings__card-top">
                        <Badge variant={typeColors[listing.type]} size="md">{typeEmoji[listing.type]} {listing.type}</Badge>
                        <Badge variant="default" size="sm">{listing.category}</Badge>
                      </div>
                      <h3 className="listings__card-title">{listing.title}</h3>
                      <p className="listings__card-desc">{listing.description?.slice(0, 100)}...</p>
                      <div className="listings__card-footer">
                        <div className="listings__card-owner">
                          <Avatar src={listing.owner?.avatar} name={listing.owner?.name || ''} size="sm" />
                          <span>{listing.owner?.name}</span>
                        </div>
                        <span className="listings__card-location">📍 {listing.location?.address?.slice(0, 20) || 'Local'}</span>
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
