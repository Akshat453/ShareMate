import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './CreateForm.css';

const listingSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  type: z.enum(['share', 'give', 'take']),
  category: z.string().min(1, 'Category required'),
  address: z.string().min(3),
});

export default function CreateListing() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(listingSchema),
    defaultValues: { type: 'share', category: '' },
  });

  const onSubmit = async (formData) => {
    try {
      const listingData = {
        ...formData,
        location: { address: formData.address, type: 'Point', coordinates: [77.209, 28.6139] },
      };
      delete listingData.address;
      const { data } = await api.post('/listings', listingData);
      navigate(`/listings/${data.data.listing._id}`);
    } catch (err) { alert(err.response?.data?.message || 'Failed to create listing'); }
  };

  return (
    <div className="page-content">
      <div className="container">
        <motion.div className="create-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="create-form__title">New Listing</h1>
          <p className="create-form__subtitle">Share, give, or request resources from your community.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="create-form__body">
            <div className="create-form__field">
              <label className="create-form__label">Type</label>
              <select {...register('type')} className="create-form__select">
                <option value="share">🔄 Share</option>
                <option value="give">🎁 Give</option>
                <option value="take">🙏 Take / Request</option>
              </select>
            </div>
            <Input label="Title" {...register('title')} error={errors.title?.message} />
            <div className="create-form__field">
              <label className="create-form__label">Category</label>
              <select {...register('category')} className="create-form__select">
                <option value="">Select category</option>
                <option value="tools">Tools</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="clothing">Clothing</option>
                <option value="food">Food</option>
                <option value="books">Books</option>
                <option value="services">Services</option>
                <option value="other">Other</option>
              </select>
              {errors.category && <span className="create-form__error">{errors.category.message}</span>}
            </div>
            <div className="create-form__field">
              <label className="create-form__label">Description</label>
              <textarea {...register('description')} className="create-form__textarea" rows={5} placeholder="Describe the item or service..." />
              {errors.description && <span className="create-form__error">{errors.description.message}</span>}
            </div>
            <Input label="Location" {...register('address')} error={errors.address?.message} />
            <div className="create-form__actions">
              <Button type="button" variant="subtle" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>Create Listing</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
