import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, required: true,
    enum: ['event_invite', 'event_update', 'event_reminder', 'listing_request', 'listing_update', 'message', 'badge', 'system'],
  },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
