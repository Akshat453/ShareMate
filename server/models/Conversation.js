import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  type: { type: String, enum: ['direct', 'event', 'listing'], default: 'direct' },
  relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  relatedListing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date,
  },
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
