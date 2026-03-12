import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String, default: '' },
  banner: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 500 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    address: { type: String, default: '' },
  },
  role: { type: String, enum: ['user', 'organizer', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  refreshTokens: [String],
  stats: {
    eventsOrganized: { type: Number, default: 0 },
    eventsJoined: { type: Number, default: 0 },
    resourcesShared: { type: Number, default: 0 },
    hoursVolunteered: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    impactScore: { type: Number, default: 0 },
  },
  badges: [{
    id: String,
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

userSchema.index({ 'location': '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokens;
  delete obj.verificationToken;
  delete obj.verificationExpires;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
