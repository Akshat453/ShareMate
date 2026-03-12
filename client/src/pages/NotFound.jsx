import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <motion.div
        style={{ textAlign: 'center' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '6rem', color: 'var(--accent-primary)', lineHeight: 1 }}>404</h1>
        <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button variant="primary">Go Home</Button>
        </Link>
      </motion.div>
    </div>
  );
}
