import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import Avatar from './Avatar';
import Button from './Button';
import NotificationBell from './NotificationBell';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { path: '/events', label: 'Community' },
    { path: '/listings', label: 'Share' },
    { path: '/squad', label: 'Squad Up' },
    { path: '/map', label: 'Map' },
  ];

  if (isAuthenticated) {
    navLinks.push({ path: '/dashboard', label: 'Dashboard' });
  }

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <svg className="navbar__logo-icon" width="32" height="32" viewBox="0 0 100 100">
            <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="none" stroke="url(#navGold)" strokeWidth="4" opacity="0.7"/>
            <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" fill="none" stroke="url(#navGold)" strokeWidth="4"/>
            <defs>
              <linearGradient id="navGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#E8C547' }} />
                <stop offset="100%" style={{ stopColor: '#D4845A' }} />
              </linearGradient>
            </defs>
          </svg>
          <span className="navbar__logo-text">ShareMate</span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar__links">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="navbar__right">
          {isAuthenticated ? (
            <div className="navbar__user" ref={dropdownRef}>
              <NotificationBell />
              <button className="navbar__avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <Avatar src={user?.avatar} name={user?.name || ''} size="sm" />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="navbar__dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="navbar__dropdown-header">
                      <p className="navbar__dropdown-name">{user?.name}</p>
                      <p className="navbar__dropdown-email">{user?.email}</p>
                    </div>
                    <div className="navbar__dropdown-divider" />
                    <Link to="/profile" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>My Profile</Link>
                    <Link to="/dashboard" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                    <Link to="/chat" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>Messages</Link>
                    <div className="navbar__dropdown-divider" />
                    <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>Sign Out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link to="/register"><Button variant="primary" size="sm">Get Started</Button></Link>
            </div>
          )}

          {/* Mobile Toggle */}
          <button className="navbar__mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <span className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <NavLink
                  to={link.path}
                  className="navbar__mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </NavLink>
              </motion.div>
            ))}
            {!isAuthenticated && (
              <div className="navbar__mobile-auth">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" fullWidth>Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" fullWidth>Get Started</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
