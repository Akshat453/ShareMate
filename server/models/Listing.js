import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  type: { type: String, enum: ['share', 'give', 'take'], required: true },
  category: { 
    type: String, required: true,
    enum: ['tools', 'electronics', 'furniture', 'clothing', 'food', 'books', 'services', 'other'],
  },
  subcategory: { type: String, default: '' },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 2000 },
  images: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    address: { type: String, required: true },
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  availability: {
    start: { type: Date },
    end: { type: Date },
  },
  status: { type: String, enum: ['available', 'reserved', 'completed'], default: 'available' },
  requests: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

listingSchema.index({ location: '2dsphere' });
listingSchema.index({ type: 1, category: 1, status: 1 });

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
