import { motion } from 'framer-motion';
import './Card.css';

export default function Card({ children, className = '', hover = true, glow = false, onClick, ...props }) {
  return (
    <motion.div
      className={`card ${hover ? 'card--hover' : ''} ${glow ? 'card--glow' : ''} ${className}`}
      whileHover={hover ? { y: -6, transition: { duration: 0.25 } } : {}}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
