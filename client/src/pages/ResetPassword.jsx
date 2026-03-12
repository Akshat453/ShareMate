import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useState } from 'react';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match", path: ['confirmPassword'],
});

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    try {
      await api.post(`/auth/reset-password/${token}`, { password: data.password });
      navigate('/login');
    } catch (e) {
      setError(e.response?.data?.message || 'Reset failed. Token may be expired.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg" />
      <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="auth-card__header">
          <h1 className="auth-card__title">Set New Password</h1>
          <p className="auth-card__subtitle">Choose a strong password for your account.</p>
        </div>
        {error && <div className="auth-card__error" onClick={() => setError('')}>{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="auth-card__form">
          <Input label="New Password" type="password" {...register('password')} error={errors.password?.message} />
          <Input label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
          <Button type="submit" variant="primary" fullWidth size="lg" loading={isSubmitting}>Reset Password</Button>
        </form>
      </motion.div>
    </div>
  );
}
