import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './CreateForm.css';

const eventSchema = z.object({
  title: z.string().min(3, 'Title required').max(120),
  description: z.string().min(10, 'Description required').max(2000),
  category: z.string().min(1, 'Category required'),
  address: z.string().min(3, 'Address required'),
  dateTime: z.string().min(1, 'Date required'),
  duration: z.coerce.number().min(15).max(480).default(60),
  capacity: z.coerce.number().min(2).max(1000).default(50),
  urgency: z.string().default('low'),
});

export default function CreateEvent() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: { duration: 60, capacity: 50, urgency: 'low', category: '' },
  });

  const onSubmit = async (formData) => {
    try {
      const eventData = {
        ...formData,
        location: {
          address: formData.address,
          type: 'Point',
          coordinates: [77.209, 28.6139], // Default coords — Delhi
        },
      };
      delete eventData.address;
      const { data } = await api.post('/events', eventData);
      navigate(`/events/${data.data.event._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <div className="page-content">
      <div className="container">
        <motion.div
          className="create-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="create-form__title">Create New Event</h1>
          <p className="create-form__subtitle">Organize a community activity and bring people together.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="create-form__body">
            <Input label="Event Title" {...register('title')} error={errors.title?.message} />

            <div className="create-form__field">
              <label className="create-form__label">Category</label>
              <select {...register('category')} className="create-form__select">
                <option value="">Select category</option>
                <option value="charity">Charity</option>
                <option value="environment">Environment</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
                <option value="community">Community</option>
                <option value="sports">Sports</option>
                <option value="arts">Arts</option>
                <option value="other">Other</option>
              </select>
              {errors.category && <span className="create-form__error">{errors.category.message}</span>}
            </div>

            <div className="create-form__field">
              <label className="create-form__label">Description</label>
              <textarea {...register('description')} className="create-form__textarea" rows={5} placeholder="Describe your event..." />
              {errors.description && <span className="create-form__error">{errors.description.message}</span>}
            </div>

            <Input label="Location / Address" {...register('address')} error={errors.address?.message} />

            <div className="create-form__row">
              <Input label="Date & Time" type="datetime-local" {...register('dateTime')} error={errors.dateTime?.message} />
              <Input label="Duration (min)" type="number" {...register('duration')} error={errors.duration?.message} />
            </div>

            <div className="create-form__row">
              <Input label="Capacity" type="number" {...register('capacity')} error={errors.capacity?.message} />
              <div className="create-form__field">
                <label className="create-form__label">Urgency</label>
                <select {...register('urgency')} className="create-form__select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="create-form__actions">
              <Button type="button" variant="subtle" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>Create Event</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
