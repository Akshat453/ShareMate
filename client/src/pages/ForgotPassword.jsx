import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useState } from 'react';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch (e) { /* always show success for security */ }
    finally { setLoading(false); setSent(true); }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg" />
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">
            <svg width="40" height="40" viewBox="0 0 100 100">
              <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="none" stroke="#E8C547" strokeWidth="4" opacity="0.7"/>
              <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" fill="none" stroke="#E8C547" strokeWidth="4"/>
            </svg>
          </Link>
          <h1 className="auth-card__title">Reset Password</h1>
          <p className="auth-card__subtitle">
            {sent
              ? 'If an account exists with that email, a reset link has been sent.'
              : 'Enter your email and we\'ll send you a reset link.'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="auth-card__form">
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
            <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📧</span>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Check your inbox for the reset link.</p>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="ghost">Back to Sign In</Button>
            </Link>
          </div>
        )}

        <p className="auth-card__footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
