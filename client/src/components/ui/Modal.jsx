import { motion, AnimatePresence } from 'framer-motion';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`modal modal--${size}`}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="modal__header">
              <h3 className="modal__title">{title}</h3>
              <button className="modal__close" onClick={onClose} aria-label="Close modal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal__body">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
