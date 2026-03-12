import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 2000 },
  category: { 
    type: String, required: true,
    enum: ['charity', 'environment', 'health', 'education', 'community', 'sports', 'arts', 'other'],
  },
  subcategory: { type: String, default: '' },
  images: [String],
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    address: { type: String, required: true },
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  dateTime: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // minutes
  capacity: { type: Number, default: 50 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  resources: [{
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'pcs' },
    provided: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }],
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  tags: [String],
  urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
}, { timestamps: true });

eventSchema.index({ location: '2dsphere' });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ dateTime: 1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;
