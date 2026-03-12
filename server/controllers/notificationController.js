import Notification from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, data: { notifications, unreadCount }, message: '', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, data: null, message: 'Notification marked as read.', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, data: null, message: 'All notifications marked as read.', errors: [] });
  } catch (error) {
    next(error);
  }
};
