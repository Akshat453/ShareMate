import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SQUAD_CATEGORIES } from '../../utils/squadCategories';
import Avatar from './Avatar';
import Badge from './Badge';
import Button from './Button';
import './SquadCard.css';

export default function SquadCard({ post, onJoin, onInterest }) {
  const cat = SQUAD_CATEGORIES[post.category] || SQUAD_CATEGORIES.custom;
  const spotsLeft = post.maxParticipants - (post.currentParticipants?.length || 0);
  const fillPercent = ((post.currentParticipants?.length || 0) / post.maxParticipants) * 100;
  const isUrgent = post.urgency === 'urgent' || post.urgency === 'high';

  // Countdown for actionDeadline
  let countdown = null;
  if (post.actionDeadline) {
    const diff = new Date(post.actionDeadline) - Date.now();
    if (diff > 0 && diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      countdown = mins > 0 ? `${mins}m left` : '<1m left';
    }
  }

  // Gap remaining for order splits
  const gapRemaining = post.meta?.gapRemaining ?? (post.category === 'order_split'
    ? Math.max(0, (post.meta?.targetThreshold || 0) - (post.meta?.currentCartValue || 0))
    : null);
  const gapPercent = post.category === 'order_split' && post.meta?.targetThreshold
    ? ((post.meta.currentCartValue || 0) / post.meta.targetThreshold) * 100
    : null;

  // Display label for custom posts
  const categoryLabel = post.category === 'custom'
    ? post.customCategoryLabel || 'Custom'
    : cat.label;

  return (
    <Link to={`/squad/${post._id}`} className="squad-card-link">
      <motion.div
        className={`squad-card ${isUrgent ? 'squad-card--urgent' : ''} ${post.status === 'full' ? 'squad-card--full' : ''}`}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
      >
        {/* Header */}
        <div className="squad-card__header">
          <span className="squad-card__cat-pill" style={{ background: `${cat.color}20`, color: cat.color, borderColor: `${cat.color}40` }}>
            {cat.icon} {categoryLabel}
          </span>
          <div className="squad-card__header-right">
            {countdown && <span className="squad-card__countdown">⏱ {countdown}</span>}
            {isUrgent && <Badge variant="red" size="sm">Urgent</Badge>}
            {post.suggestedForCategory && <span className="squad-card__trending">🔥</span>}
          </div>
        </div>

        {/* Title */}
        <h3 className="squad-card__title">{post.title}</h3>

        {/* Location */}
        {post.location?.address && (
          <div className="squad-card__location">
            <span>📍</span> {post.location.address}
          </div>
        )}

        {/* Cost Block */}
        {post.costPerPerson != null && post.costPerPerson > 0 && (
          <div className="squad-card__cost">
            <span className="squad-card__cost-amount">₹{post.costPerPerson}</span>
            <span className="squad-card__cost-label">/ person</span>
            {post.totalCost && (
              <span className="squad-card__cost-original">₹{post.totalCost} total</span>
            )}
          </div>
        )}

        {/* Order Split Gap Tracker */}
        {gapRemaining !== null && (
          <div className="squad-card__gap">
            <div className="squad-card__gap-bar">
              <div className="squad-card__gap-fill" style={{ width: `${Math.min(gapPercent || 0, 100)}%` }} />
            </div>
            <span className="squad-card__gap-text">
              {gapRemaining > 0 ? `Gap: ₹${gapRemaining} remaining` : '✅ Threshold reached!'}
            </span>
          </div>
        )}

        {/* Participants */}
        <div className="squad-card__participants">
          <div className="squad-card__avatars">
            {post.currentParticipants?.slice(0, 4).map((p, i) => (
              <Avatar key={p._id || i} src={p.avatar} name={p.name || ''} size="sm" />
            ))}
          </div>
          <div className="squad-card__fill-info">
            <div className="squad-card__fill-bar">
              <div className="squad-card__fill-progress" style={{ width: `${fillPercent}%` }} />
            </div>
            <span className="squad-card__fill-text font-mono">
              {post.currentParticipants?.length || 0}/{post.maxParticipants} joined
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="squad-card__actions" onClick={(e) => e.preventDefault()}>
          {post.status === 'full' ? (
            <Button variant="ghost" size="sm" fullWidth disabled>Full — Waitlist</Button>
          ) : (
            <>
              <Button variant="primary" size="sm" style={{ flex: 2 }} onClick={() => onJoin?.(post._id)}>
                Squad Up
              </Button>
              <Button variant="ghost" size="sm" style={{ flex: 1 }} onClick={() => onInterest?.(post._id)}>
                👀
              </Button>
            </>
          )}
        </div>

        {/* Creator */}
        <div className="squad-card__creator">
          <Avatar src={post.creator?.avatar} name={post.creator?.name || ''} size="xs" />
          <span>{post.creator?.name}</span>
          <span className="squad-card__time">
            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
