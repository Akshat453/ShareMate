import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (e) { /* error handled in store */ }
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
          <h1 className="auth-card__title">Welcome Back</h1>
          <p className="auth-card__subtitle">Sign in to continue building community impact</p>
        </div>

        {error && <div className="auth-card__error" onClick={clearError}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-card__form">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <div className="auth-card__forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="auth-card__footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
