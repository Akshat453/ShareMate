import mongoose from 'mongoose';

const squadPostSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 120 },
  description: { type: String, maxlength: 2000 },
  category: {
    type: String,
    required: true,
    enum: [
      'carpool', 'order_split', 'food_order', 'ticket_split',
      'bulk_buy', 'tool_rent', 'travel', 'courier', 'subscription',
      'fitness', 'community_buy', 'study_group', 'custom',
    ],
  },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Location
  location: {
    address: String,
    coordinates: { type: [Number], index: '2dsphere' }, // [lng, lat]
  },
  locationRadius: { type: Number, default: 5 }, // km

  // Squad sizing
  minParticipants: { type: Number, default: 2 },
  maxParticipants: { type: Number, default: 10 },
  currentParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Status
  status: {
    type: String,
    enum: ['open', 'forming', 'full', 'confirmed', 'completed', 'cancelled'],
    default: 'open',
  },

  // Deadlines
  expiresAt: Date,
  actionDeadline: Date,

  // Cost
  totalCost: Number,
  costPerPerson: Number,
  costSplitMethod: { type: String, enum: ['equal', 'custom', 'free', 'organizer_decides'], default: 'equal' },
  currency: { type: String, default: 'INR' },

  // Category-specific dynamic fields
  meta: { type: Map, of: mongoose.Schema.Types.Mixed },

  // Engagement
  interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [String],
  urgency: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  isRecurring: { type: Boolean, default: false },
  recurringSchedule: String,

  // Custom category fields
  customCategoryLabel: String,
  customBenefitType: {
    type: String,
    enum: ['save_money', 'save_time', 'safety', 'more_fun', 'min_group', 'other', null],
  },
  customBenefitNote: String,
  userDefinedTags: {
    type: [String],
    validate: [v => v.length <= 5, 'Max 5 user-defined tags'],
  },
  image: String, // Cloudinary URL for custom posts

  // Community voting
  suggestedForCategory: { type: Boolean, default: false },

  // Moderation
  isVerified: { type: Boolean, default: false },
  reportCount: { type: Number, default: 0 },
}, { timestamps: true });

// Indexes
squadPostSchema.index({ 'location.coordinates': '2dsphere' });
squadPostSchema.index({ category: 1, status: 1 });
squadPostSchema.index({ creator: 1 });
squadPostSchema.index({ expiresAt: 1 });
squadPostSchema.index({ status: 1, urgency: 1 });
squadPostSchema.index({ tags: 1 });
squadPostSchema.index({ userDefinedTags: 1 });

// Virtual: spots remaining
squadPostSchema.virtual('spotsLeft').get(function () {
  return this.maxParticipants - (this.currentParticipants?.length || 0);
});

// Auto-calculate costPerPerson
squadPostSchema.pre('save', function (next) {
  if (this.totalCost && this.costSplitMethod === 'equal') {
    const count = Math.max((this.currentParticipants?.length || 0) + 1, this.minParticipants);
    this.costPerPerson = Math.ceil(this.totalCost / count);
  }
  // Auto-status transitions
  if (this.currentParticipants?.length >= this.maxParticipants && this.status === 'open') {
    this.status = 'full';
  } else if (this.currentParticipants?.length >= this.minParticipants && this.status === 'open') {
    this.status = 'forming';
  }
  next();
});

squadPostSchema.set('toJSON', { virtuals: true });
squadPostSchema.set('toObject', { virtuals: true });

export default mongoose.model('SquadPost', squadPostSchema);
