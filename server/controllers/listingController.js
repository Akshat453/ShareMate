import Listing from '../models/Listing.js';

export const getListings = async (req, res, next) => {
  try {
    const { type, category, status, search, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    else filter.status = 'available';
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const listings = await Listing.find(filter)
      .populate('owner', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Listing.countDocuments(filter);
    res.json({
      success: true,
      data: { listings, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
      message: '',
      errors: [],
    });
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('owner', 'name avatar bio stats')
      .populate('requests.user', 'name avatar');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.', errors: [] });
    }
    res.json({ success: true, data: { listing }, message: '', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const createListing = async (req, res, next) => {
  try {
    const listing = new Listing({ ...req.body, owner: req.user._id });
    await listing.save();
    await listing.populate('owner', 'name avatar');
    res.status(201).json({ success: true, data: { listing }, message: 'Listing created.', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.', errors: [] });
    }
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.', errors: [] });
    }
    Object.assign(listing, req.body);
    await listing.save();
    res.json({ success: true, data: { listing }, message: 'Listing updated.', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.', errors: [] });
    }
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.', errors: [] });
    }
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: null, message: 'Listing deleted.', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const requestListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.', errors: [] });
    }
    const existingRequest = listing.requests.find(r => r.user.toString() === req.user._id.toString());
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Request already sent.', errors: [] });
    }
    listing.requests.push({ user: req.user._id, message: req.body.message || '' });
    await listing.save();
    await listing.populate('requests.user', 'name avatar');
    res.json({ success: true, data: { listing }, message: 'Request sent.', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const handleRequest = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.', errors: [] });
    }
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.', errors: [] });
    }
    const request = listing.requests.id(req.params.reqId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.', errors: [] });
    }
    request.status = req.body.status; // 'accepted' or 'declined'
    if (req.body.status === 'accepted') {
      listing.status = 'reserved';
    }
    await listing.save();
    await listing.populate('requests.user', 'name avatar');
    res.json({ success: true, data: { listing }, message: `Request ${req.body.status}.`, errors: [] });
  } catch (error) {
    next(error);
  }
};
