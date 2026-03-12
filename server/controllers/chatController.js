import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar')
      .populate('relatedEvent', 'title')
      .populate('relatedListing', 'title')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: { conversations }, message: '', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const { userId, eventId, listingId } = req.body;
    let conversation;

    if (userId) {
      // Check for existing direct conversation
      conversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [req.user._id, userId], $size: 2 },
      });
      if (!conversation) {
        conversation = new Conversation({
          participants: [req.user._id, userId],
          type: 'direct',
        });
        await conversation.save();
      }
    } else if (eventId) {
      conversation = await Conversation.findOne({ relatedEvent: eventId, type: 'event' });
      if (!conversation) {
        conversation = new Conversation({
          participants: [req.user._id],
          type: 'event',
          relatedEvent: eventId,
        });
        await conversation.save();
      }
      if (!conversation.participants.includes(req.user._id)) {
        conversation.participants.push(req.user._id);
        await conversation.save();
      }
    } else if (listingId) {
      conversation = new Conversation({
        participants: [req.user._id],
        type: 'listing',
        relatedListing: listingId,
      });
      await conversation.save();
    }

    await conversation.populate('participants', 'name avatar');
    res.status(201).json({ success: true, data: { conversation }, message: '', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({ success: true, data: { messages: messages.reverse() }, message: '', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const message = new Message({
      conversation: req.params.id,
      sender: req.user._id,
      content: req.body.content,
      type: req.body.type || 'text',
      readBy: [req.user._id],
    });
    await message.save();
    await message.populate('sender', 'name avatar');

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(req.params.id, {
      lastMessage: { content: message.content, sender: req.user._id, createdAt: message.createdAt },
    });

    res.status(201).json({ success: true, data: { message }, message: '', errors: [] });
  } catch (error) {
    next(error);
  }
};
