import User from '../models/User.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -refreshTokens');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.', errors: [] });
    }
    res.json({ success: true, data: { user }, message: '', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'bio', 'avatar', 'banner', 'location'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: { user: user.toPublicJSON() }, message: 'Profile updated.', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('name avatar stats.impactScore stats.eventsJoined stats.hoursVolunteered badges')
      .sort({ 'stats.impactScore': -1 })
      .limit(20);
    res.json({ success: true, data: { users }, message: '', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const getUserEvents = async (req, res, next) => {
  try {
    const { Event } = await import('../models/Event.js');
    const events = await Event.find({
      $or: [
        { organizer: req.params.id },
        { participants: req.params.id },
      ],
    }).populate('organizer', 'name avatar').sort({ dateTime: -1 });
    res.json({ success: true, data: { events }, message: '', errors: [] });
  } catch (error) {
    next(error);
  }
};
