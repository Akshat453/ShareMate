import Event from '../models/Event.js';

export const getEvents = async (req, res, next) => {
  try {
    const { category, status, urgency, search, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const events = await Event.find(filter)
      .populate('organizer', 'name avatar')
      .sort({ dateTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(filter);
    res.json({
      success: true,
      data: { events, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
      message: '',
      errors: [],
    });
  } catch (error) {
    next(error);
  }
};

export const getNearbyEvents = async (req, res, next) => {
  try {
    const { lng, lat, radius = 10000 } = req.query;
    if (!lng || !lat) {
      return res.status(400).json({ success: false, message: 'Coordinates required.', errors: [] });
    }
    const events = await Event.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
      status: { $in: ['upcoming', 'ongoing'] },
    }).populate('organizer', 'name avatar').limit(50);

    res.json({ success: true, data: { events }, message: '', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name avatar bio stats')
      .populate('participants', 'name avatar');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.', errors: [] });
    }
    res.json({ success: true, data: { event }, message: '', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = new Event({ ...req.body, organizer: req.user._id });
    await event.save();
    await event.populate('organizer', 'name avatar');
    res.status(201).json({ success: true, data: { event }, message: 'Event created.', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.', errors: [] });
    }
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.', errors: [] });
    }

    Object.assign(event, req.body);
    await event.save();
    await event.populate('organizer', 'name avatar');
    res.json({ success: true, data: { event }, message: 'Event updated.', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.', errors: [] });
    }
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.', errors: [] });
    }
    event.status = 'cancelled';
    await event.save();
    res.json({ success: true, data: null, message: 'Event cancelled.', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const joinEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.', errors: [] });
    }
    if (event.participants.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already joined.', errors: [] });
    }
    if (event.participants.length >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Event is full.', errors: [] });
    }
    event.participants.push(req.user._id);
    await event.save();
    await event.populate('participants', 'name avatar');
    res.json({ success: true, data: { event }, message: 'Joined event.', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const leaveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.', errors: [] });
    }
    event.participants = event.participants.filter(p => p.toString() !== req.user._id.toString());
    await event.save();
    res.json({ success: true, data: { event }, message: 'Left event.', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const contributeResource = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.', errors: [] });
    }
    const { resourceIndex } = req.body;
    if (event.resources[resourceIndex]) {
      event.resources[resourceIndex].provided.push(req.user._id);
      await event.save();
    }
    res.json({ success: true, data: { event }, message: 'Resource contributed.', errors: [] });
  } catch (error) {
    next(error);
  }
};
