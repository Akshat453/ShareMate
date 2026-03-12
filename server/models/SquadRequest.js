import mongoose from 'mongoose';

const squadRequestSchema = new mongoose.Schema({
  squadPost: { type: mongoose.Schema.Types.ObjectId, ref: 'SquadPost', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, maxlength: 300 },
  quantity: Number,
  customAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'left'],
    default: 'pending',
  },
}, { timestamps: true });

squadRequestSchema.index({ squadPost: 1, requester: 1 }, { unique: true });
squadRequestSchema.index({ requester: 1, status: 1 });

export default mongoose.model('SquadRequest', squadRequestSchema);
