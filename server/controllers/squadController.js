import SquadPost from '../models/SquadPost.js';
import SquadRequest from '../models/SquadRequest.js';
import Notification from '../models/Notification.js';

// ────────────────────────── CRUD ──────────────────────────

// GET /api/squad — list with filters
export const getSquadPosts = async (req, res, next) => {
  try {
    const {
      category, status, urgency, maxCostPerPerson, minSpots,
      isRecurring, sortBy, lat, lng, radius, search, page = 1, limit = 20,
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    else filter.status = { $in: ['open', 'forming'] };
    if (urgency) filter.urgency = urgency;
    if (isRecurring === 'true') filter.isRecurring = true;
    if (maxCostPerPerson) filter.costPerPerson = { $lte: Number(maxCostPerPerson) };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { userDefinedTags: { $in: [new RegExp(search, 'i')] } },
        { customCategoryLabel: { $regex: search, $options: 'i' } },
      ];
    }

    // Geospatial
    if (lat && lng) {
      filter['location.coordinates'] = {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: (Number(radius) || 5) * 1000,
        },
      };
    }

    // minSpots filter — need to compute on aggregation but let's do a post-filter
    let sort = { createdAt: -1 };
    if (sortBy === 'expiring_soon') sort = { actionDeadline: 1 };
    else if (sortBy === 'most_popular') sort = { 'currentParticipants': -1 };
    else if (sortBy === 'nearest' && lat && lng) sort = {}; // already sorted by $nearSphere

    const skip = (Number(page) - 1) * Number(limit);
    let posts = await SquadPost.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('creator', 'name avatar')
      .populate('currentParticipants', 'name avatar')
      .lean({ virtuals: true });

    if (minSpots) {
      posts = posts.filter(p => (p.maxParticipants - (p.currentParticipants?.length || 0)) >= Number(minSpots));
    }

    const total = await SquadPost.countDocuments(filter);
    res.json({ success: true, data: { posts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
};

// POST /api/squad — create
export const createSquadPost = async (req, res, next) => {
  try {
    const data = { ...req.body, creator: req.user._id, currentParticipants: [req.user._id] };
    // Server-side cost calculation
    if (data.totalCost && data.costSplitMethod === 'equal' && data.maxParticipants) {
      data.costPerPerson = Math.ceil(data.totalCost / data.maxParticipants);
    }
    // Never allow client to set suggestedForCategory
    delete data.suggestedForCategory;

    const post = await SquadPost.create(data);
    const populated = await SquadPost.findById(post._id)
      .populate('creator', 'name avatar')
      .populate('currentParticipants', 'name avatar');

    res.status(201).json({ success: true, data: { post: populated } });
  } catch (err) { next(err); }
};

// GET /api/squad/:id
export const getSquadPost = async (req, res, next) => {
  try {
    const post = await SquadPost.findById(req.params.id)
      .populate('creator', 'name avatar bio')
      .populate('currentParticipants', 'name avatar')
      .populate('interestedUsers', 'name avatar');
    if (!post) return res.status(404).json({ success: false, message: 'Squad post not found' });
    res.json({ success: true, data: { post } });
  } catch (err) { next(err); }
};

// PUT /api/squad/:id — update (creator only)
export const updateSquadPost = async (req, res, next) => {
  try {
    const post = await SquadPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the creator can edit' });
    }
    delete req.body.suggestedForCategory; // never allow client to set
    delete req.body.creator;

    Object.assign(post, req.body);
    // Recalculate cost
    if (post.totalCost && post.costSplitMethod === 'equal') {
      const count = Math.max(post.currentParticipants.length, post.minParticipants);
      post.costPerPerson = Math.ceil(post.totalCost / count);
    }
    await post.save();
    const updated = await SquadPost.findById(post._id)
      .populate('creator', 'name avatar')
      .populate('currentParticipants', 'name avatar');
    res.json({ success: true, data: { post: updated } });
  } catch (err) { next(err); }
};

// DELETE /api/squad/:id — cancel (creator only)
export const deleteSquadPost = async (req, res, next) => {
  try {
    const post = await SquadPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the creator can cancel' });
    }
    post.status = 'cancelled';
    await post.save();
    // Notify participants
    const notifs = post.currentParticipants
      .filter(p => p.toString() !== req.user._id.toString())
      .map(userId => ({
        recipient: userId, type: 'system',
        title: 'Squad Cancelled',
        body: `"${post.title}" has been cancelled by the organizer.`,
        link: `/squad/${post._id}`,
      }));
    if (notifs.length) await Notification.insertMany(notifs);
    res.json({ success: true, message: 'Squad post cancelled' });
  } catch (err) { next(err); }
};

// ────────────────────────── JOIN / LEAVE / INTEREST ──────────────────────────

// POST /api/squad/:id/join
export const joinSquadPost = async (req, res, next) => {
  try {
    const post = await SquadPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    if (post.status === 'full' || post.status === 'cancelled' || post.status === 'completed') {
      return res.status(400).json({ success: false, message: `Cannot join — post is ${post.status}` });
    }
    if (post.currentParticipants.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }
    if (post.currentParticipants.length >= post.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Squad is full' });
    }

    post.currentParticipants.push(req.user._id);
    // Remove from interested if was there
    post.interestedUsers = post.interestedUsers.filter(u => u.toString() !== req.user._id.toString());

    // Recalculate cost
    if (post.totalCost && post.costSplitMethod === 'equal') {
      post.costPerPerson = Math.ceil(post.totalCost / post.currentParticipants.length);
    }

    // For order_split: update gap
    if (post.category === 'order_split' && post.meta) {
      const target = post.meta.get('targetThreshold') || 0;
      const current = (post.meta.get('currentCartValue') || 0) + (req.body.addedAmount || 0);
      post.meta.set('currentCartValue', current);
      post.meta.set('gapRemaining', Math.max(0, target - current));
    }

    await post.save();

    // Notify creator
    if (post.creator.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.creator, type: 'system',
        title: 'New Squad Member',
        body: `${req.user.name} joined your "${post.title}" squad!`,
        link: `/squad/${post._id}`,
      });
    }

    // Notify if full
    if (post.currentParticipants.length >= post.maxParticipants) {
      await Notification.create({
        recipient: post.creator, type: 'system',
        title: '🎉 Squad is Full!',
        body: `Your "${post.title}" squad is full! Time to confirm.`,
        link: `/squad/${post._id}`,
      });
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`squad:${post._id}`).emit('squad:participant_joined', {
        postId: post._id,
        user: { name: req.user.name, avatar: req.user.avatar },
        spotsLeft: post.maxParticipants - post.currentParticipants.length,
        gapRemaining: post.meta?.get('gapRemaining'),
      });
      if (post.currentParticipants.length >= post.maxParticipants) {
        io.to(`squad:${post._id}`).emit('squad:status_changed', {
          postId: post._id, newStatus: 'full', message: 'Squad is full!',
        });
      }
    }

    const updated = await SquadPost.findById(post._id)
      .populate('creator', 'name avatar')
      .populate('currentParticipants', 'name avatar');
    res.json({ success: true, data: { post: updated } });
  } catch (err) { next(err); }
};

// DELETE /api/squad/:id/leave
export const leaveSquadPost = async (req, res, next) => {
  try {
    const post = await SquadPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    if (!post.currentParticipants.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Not a member' });
    }
    if (post.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Creator cannot leave — cancel the post instead' });
    }

    post.currentParticipants = post.currentParticipants.filter(u => u.toString() !== req.user._id.toString());
    if (post.status === 'full') post.status = 'forming';
    if (post.currentParticipants.length < post.minParticipants && post.status === 'forming') {
      post.status = 'open';
    }
    // Recalculate cost
    if (post.totalCost && post.costSplitMethod === 'equal' && post.currentParticipants.length > 0) {
      post.costPerPerson = Math.ceil(post.totalCost / post.currentParticipants.length);
    }
    await post.save();

    // Notify creator
    await Notification.create({
      recipient: post.creator, type: 'system',
      title: 'Member Left',
      body: `${req.user.name} left your "${post.title}" squad — 1 spot open again.`,
      link: `/squad/${post._id}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`squad:${post._id}`).emit('squad:status_changed', {
        postId: post._id, newStatus: post.status, message: `${req.user.name} left the squad`,
      });
    }

    res.json({ success: true, message: 'Left the squad' });
  } catch (err) { next(err); }
};

// POST /api/squad/:id/interest
export const expressInterest = async (req, res, next) => {
  try {
    const post = await SquadPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    if (post.interestedUsers.includes(req.user._id) || post.currentParticipants.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already interested or joined' });
    }
    post.interestedUsers.push(req.user._id);

    // Community voting: check thresholds for custom posts
    if (post.category === 'custom' && !post.suggestedForCategory) {
      const joinCount = post.currentParticipants.length;
      const interestCount = post.interestedUsers.length;
      if (joinCount >= 10 || interestCount >= 20) {
        post.suggestedForCategory = true;
        await Notification.create({
          recipient: post.creator, type: 'badge_earned',
          title: '🔥 Your idea is trending!',
          body: `Your "${post.customCategoryLabel}" squad is loved by the community!`,
          link: `/squad/${post._id}`,
        });
      }
    }

    await post.save();
    res.json({ success: true, message: 'Interest recorded' });
  } catch (err) { next(err); }
};

// GET /api/squad/:id/participants
export const getParticipants = async (req, res, next) => {
  try {
    const post = await SquadPost.findById(req.params.id)
      .populate('currentParticipants', 'name avatar bio stats');
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: { participants: post.currentParticipants } });
  } catch (err) { next(err); }
};

// ────────────────────────── DISCOVERY ENDPOINTS ──────────────────────────

// GET /api/squad/nearby
export const getNearbySquads = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });
    const posts = await SquadPost.find({
      status: { $in: ['open', 'forming'] },
      'location.coordinates': {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius) * 1000,
        },
      },
    })
      .limit(50)
      .populate('creator', 'name avatar')
      .populate('currentParticipants', 'name avatar')
      .lean({ virtuals: true });
    res.json({ success: true, data: { posts } });
  } catch (err) { next(err); }
};

// GET /api/squad/trending
export const getTrending = async (req, res, next) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const posts = await SquadPost.find({
      status: { $in: ['open', 'forming'] },
      updatedAt: { $gte: oneHourAgo },
    })
      .sort({ 'currentParticipants': -1 })
      .limit(10)
      .populate('creator', 'name avatar')
      .populate('currentParticipants', 'name avatar')
      .lean({ virtuals: true });
    res.json({ success: true, data: { posts } });
  } catch (err) { next(err); }
};

// GET /api/squad/expiring-soon
export const getExpiringSoon = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyMins = new Date(Date.now() + 30 * 60 * 1000);
    const posts = await SquadPost.find({
      status: { $in: ['open', 'forming'] },
      actionDeadline: { $gte: now, $lte: thirtyMins },
    })
      .sort({ actionDeadline: 1 })
      .limit(10)
      .populate('creator', 'name avatar')
      .populate('currentParticipants', 'name avatar')
      .lean({ virtuals: true });
    res.json({ success: true, data: { posts } });
  } catch (err) { next(err); }
};

// GET /api/squad/category/:category
export const getByCategory = async (req, res, next) => {
  try {
    const posts = await SquadPost.find({
      category: req.params.category,
      status: { $in: ['open', 'forming'] },
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('creator', 'name avatar')
      .populate('currentParticipants', 'name avatar')
      .lean({ virtuals: true });
    res.json({ success: true, data: { posts } });
  } catch (err) { next(err); }
};

// ────────────────────────── MY SQUADS ──────────────────────────

export const getMyCreated = async (req, res, next) => {
  try {
    const posts = await SquadPost.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .populate('currentParticipants', 'name avatar')
      .lean({ virtuals: true });
    res.json({ success: true, data: { posts } });
  } catch (err) { next(err); }
};

export const getMyJoined = async (req, res, next) => {
  try {
    const posts = await SquadPost.find({
      currentParticipants: req.user._id,
      creator: { $ne: req.user._id },
    })
      .sort({ createdAt: -1 })
      .populate('creator', 'name avatar')
      .populate('currentParticipants', 'name avatar')
      .lean({ virtuals: true });
    res.json({ success: true, data: { posts } });
  } catch (err) { next(err); }
};

export const getMyInterested = async (req, res, next) => {
  try {
    const posts = await SquadPost.find({ interestedUsers: req.user._id })
      .sort({ createdAt: -1 })
      .populate('creator', 'name avatar')
      .populate('currentParticipants', 'name avatar')
      .lean({ virtuals: true });
    res.json({ success: true, data: { posts } });
  } catch (err) { next(err); }
};

// ────────────────────────── CONFIRM / COMPLETE ──────────────────────────

export const confirmSquad = async (req, res, next) => {
  try {
    const post = await SquadPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator can confirm' });
    }
    post.status = 'confirmed';
    await post.save();

    // Notify all participants
    const notifs = post.currentParticipants
      .filter(p => p.toString() !== req.user._id.toString())
      .map(userId => ({
        recipient: userId, type: 'system',
        title: 'Squad Confirmed! ✅',
        body: `"${post.title}" is confirmed. Check details and chat.`,
        link: `/squad/${post._id}`,
      }));
    if (notifs.length) await Notification.insertMany(notifs);

    const io = req.app.get('io');
    if (io) {
      io.to(`squad:${post._id}`).emit('squad:status_changed', {
        postId: post._id, newStatus: 'confirmed', message: 'Squad confirmed by organizer!',
      });
    }

    res.json({ success: true, data: { post } });
  } catch (err) { next(err); }
};

export const completeSquad = async (req, res, next) => {
  try {
    const post = await SquadPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator can complete' });
    }
    post.status = 'completed';
    await post.save();
    res.json({ success: true, data: { post } });
  } catch (err) { next(err); }
};

// ────────────────────────── TAG SUGGESTIONS ──────────────────────────

// POST /api/squad/suggest-tags
export const suggestTags = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const text = `${title || ''} ${description || ''}`.toLowerCase();
    // Remove common stop words
    const stopWords = new Set(['i', 'me', 'my', 'we', 'our', 'you', 'your', 'it', 'its',
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'can', 'to', 'of',
      'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
      'before', 'after', 'and', 'but', 'or', 'not', 'no', 'so', 'if', 'then', 'than',
      'that', 'this', 'these', 'those', 'what', 'which', 'who', 'whom', 'how', 'all',
      'each', 'every', 'any', 'some', 'such', 'only', 'very', 'just', 'about', 'up',
      'out', 'off', 'over', 'own', 'same', 'need', 'want', 'looking', 'anyone', 'someone',
    ]);
    const keywords = text.split(/\W+/).filter(w => w.length > 2 && !stopWords.has(w));

    let tags = [];
    if (keywords.length > 0) {
      // Find most-used tags matching keywords
      const results = await SquadPost.aggregate([
        { $match: { userDefinedTags: { $exists: true, $ne: [] } } },
        { $unwind: '$userDefinedTags' },
        { $match: { userDefinedTags: { $in: keywords.map(k => new RegExp(k, 'i')) } } },
        { $group: { _id: '$userDefinedTags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);
      tags = results.map(r => r._id);
    }

    // Fallback: top 5 most popular global tags
    if (tags.length < 5) {
      const globalTags = await SquadPost.aggregate([
        { $match: { userDefinedTags: { $exists: true, $ne: [] } } },
        { $unwind: '$userDefinedTags' },
        { $group: { _id: '$userDefinedTags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);
      const existing = new Set(tags);
      for (const t of globalTags) {
        if (!existing.has(t._id) && tags.length < 5) tags.push(t._id);
      }
    }

    res.json({ success: true, data: { tags } });
  } catch (err) { next(err); }
};
