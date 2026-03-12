import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, loading, error, clearError } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data.name, data.email, data.password);
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
          <h1 className="auth-card__title">Join ShareMate</h1>
          <p className="auth-card__subtitle">Start making an impact in your community</p>
        </div>

        {error && <div className="auth-card__error" onClick={clearError}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-card__form">
          <Input label="Full Name" {...register('name')} error={errors.name?.message} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <Input label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
