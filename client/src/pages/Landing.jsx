import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import './Landing.css';

const mockEvents = [
  { id: 1, title: 'Community Garden Cleanup', category: 'environment', date: 'Mar 15', location: 'Greenfield Park', participants: 24 },
  { id: 2, title: 'Charity Food Drive', category: 'charity', date: 'Mar 18', location: 'Downtown Center', participants: 45 },
  { id: 3, title: 'Youth Coding Workshop', category: 'education', date: 'Mar 20', location: 'Community Library', participants: 18 },
  { id: 4, title: 'Senior Health Walk', category: 'health', date: 'Mar 22', location: 'Riverside Trail', participants: 32 },
];

const features = [
  { icon: '🤝', title: 'Connect & Collaborate', desc: 'Find community events and volunteer opportunities near you.' },
  { icon: '🔄', title: 'Share Resources', desc: 'Give, take, or share tools, skills, and items with neighbors.' },
  { icon: '🗺️', title: 'Discover Nearby', desc: 'Interactive map shows everything happening around you.' },
  { icon: '⭐', title: 'Track Your Impact', desc: 'Earn badges, build your profile, and see your contribution grow.' },
];

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero" ref={heroRef}>
        <div className="hero__mesh" />
        <div className="hero__dots" />

        <motion.div className="hero__content" style={{ y: heroY, opacity: heroOpacity }}>
          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Build Something <span className="hero__title-gold">Bigger</span> Than Yourself
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Connect with your community. Share resources, volunteer together, and make a real difference — one event at a time.
          </motion.p>

          <motion.div
            className="hero__cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Link to="/events"><Button variant="primary" size="lg">Explore Events</Button></Link>
            <Link to="/register"><Button variant="ghost" size="lg">Offer Help</Button></Link>
          </motion.div>

          <motion.div
            className="hero__stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="hero__stat">
              <span className="hero__stat-number">2,400+</span>
              <span className="hero__stat-label">Active Members</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-number">580</span>
              <span className="hero__stat-label">Events Completed</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-number">12k+</span>
              <span className="hero__stat-label">Hours Volunteered</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Cards */}
        <div className="hero__floating-cards">
          {mockEvents.map((event, i) => (
            <motion.div
              key={event.id}
              className={`hero__float-card hero__float-card--${i + 1}`}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15, duration: 0.7 }}
              style={{ animation: `float ${4 + i * 0.5}s ease-in-out infinite ${i * 0.3}s` }}
            >
              <span className={`card__tag card__tag--${event.category}`}>{event.category}</span>
              <h4 className="hero__float-title">{event.title}</h4>
              <div className="hero__float-meta">
                <span>📅 {event.date}</span>
                <span>👥 {event.participants}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Diagonal divider */}
        <div className="hero__divider" />
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <motion.div
            className="features__header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="features__title">How ShareMate Works</h2>
            <p className="features__subtitle">Everything your community needs, in one elegant platform.</p>
          </motion.div>

          <motion.div
            className="features__grid"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="features__card" hover>
                  <div className="card__body">
                    <span className="features__icon">{feature.icon}</span>
                    <h3 className="features__card-title">{feature.title}</h3>
                    <p className="features__card-desc">{feature.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-box"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="cta-box__title">Ready to Make a Difference?</h2>
            <p className="cta-box__text">Join thousands of community members who are already sharing, helping, and growing together.</p>
            <Link to="/register"><Button variant="primary" size="lg">Join ShareMate — It's Free</Button></Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div className="footer__brand">
              <span className="navbar__logo-text" style={{ fontSize: '1.2rem' }}>ShareMate</span>
              <p className="footer__text">Building communities, one connection at a time.</p>
            </div>
            <div className="footer__links">
              <Link to="/events">Events</Link>
              <Link to="/listings">Share</Link>
              <Link to="/map">Map</Link>
            </div>
          </div>
          <div className="footer__bottom">
            <p>© 2024 ShareMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
