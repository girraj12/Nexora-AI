import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

import {
  getGuestMessages,
  deleteGuestMessages,
} from '../services/guest.service.js';

export const migrateGuestChat = async (req, res) => {
  try {
    const { guestId } = req.body;

    if (!guestId) {
      return res.status(400).json({
        success: false,
        message: 'guestId is required',
      });
    }

    const guestMessages = await getGuestMessages(guestId);

    if (!guestMessages.length) {
      return res.json({
        success: true,
        message: 'No guest messages found',
        conversation: null,
      });
    }

    const conversation = await Conversation.create({
      userId: req.user.id,
      title: 'Imported Guest Chat',
    });

    const formattedMessages = guestMessages.map((msg) => ({
      conversationId: conversation._id,
      sender: msg.sender,
      content: msg.content,
      createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      updatedAt: new Date(),
    }));

    await Message.insertMany(formattedMessages);

    await deleteGuestMessages(guestId);

    res.json({
      success: true,
      message: 'Guest chat migrated successfully',
      conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};