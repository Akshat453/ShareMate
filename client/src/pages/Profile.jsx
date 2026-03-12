import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import './Profile.css';

const badgeIcons = {
  'First Event': '🌟', 'Super Volunteer': '🦸', 'Community Champion': '🏆',
  'Resource Hero': '📦', 'Connector': '🤝',
};

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = id || currentUser?._id;

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/users/${userId}`);
        setProfile(data.data.user);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <div className="page-content"><Loader /></div>;
  if (!profile) return <div className="page-content"><div className="container"><p>User not found.</p></div></div>;

  const stats = profile.stats || {};
  const isOwn = currentUser && currentUser._id === profile._id;

  return (
    <div className="page-content">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Banner */}
          <div className="profile__banner">
            <div className="profile__banner-gradient" />
          </div>

          {/* Profile Info */}
          <div className="profile__info">
            <Avatar src={profile.avatar} name={profile.name} size="2xl" ring />
            <div className="profile__info-text">
              <h1 className="profile__name">{profile.name}</h1>
              <p className="profile__bio">{profile.bio || 'Community member'}</p>
              <div className="profile__meta">
                <Badge variant="gold">{profile.role}</Badge>
                {profile.location?.address && <span className="profile__location">📍 {profile.location.address}</span>}
              </div>
            </div>
            {isOwn && <Button variant="ghost" size="sm">Edit Profile</Button>}
          </div>

          {/* Stats Row */}
          <div className="profile__stats">
            <div className="profile__stat-item">
              <span className="profile__stat-num">{stats.eventsOrganized || 0}</span>
              <span className="profile__stat-label">Organized</span>
            </div>
            <div className="profile__stat-item">
              <span className="profile__stat-num">{stats.eventsJoined || 0}</span>
              <span className="profile__stat-label">Joined</span>
            </div>
            <div className="profile__stat-item">
              <span className="profile__stat-num">{stats.resourcesShared || 0}</span>
              <span className="profile__stat-label">Shared</span>
            </div>
            <div className="profile__stat-item">
              <span className="profile__stat-num">{stats.hoursVolunteered || 0}</span>
              <span className="profile__stat-label">Hours</span>
            </div>
            <div className="profile__stat-item">
              <span className="profile__stat-num">{stats.impactScore || 0}</span>
              <span className="profile__stat-label">Impact</span>
            </div>
          </div>

          {/* Badges */}
          {profile.badges?.length > 0 && (
            <div className="profile__badges">
              <h2 className="profile__section-title">Badges</h2>
              <div className="profile__badge-grid">
                {profile.badges.map((badge, i) => (
                  <div key={i} className="profile__badge-item">
                    <span className="profile__badge-icon">{badgeIcons[badge.name] || '🏅'}</span>
                    <span className="profile__badge-name">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
