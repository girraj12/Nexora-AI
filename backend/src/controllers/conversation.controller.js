import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import crypto from 'crypto';

export const createConversation = async (req, res) => {
  try {
    const conversation = await Conversation.create({
      userId: req.user.id,
      title: 'New Chat',
    });

    res.json(conversation);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        message: 'Conversation not found',
      });
    }

    const messages = await Message.find({
      conversationId: req.params.id,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        message: 'Conversation not found',
      });
    }

    await Message.deleteMany({
      conversationId: req.params.id,
    });

    await Conversation.deleteOne({
      _id: req.params.id,
    });

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const shareConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        message: 'Conversation not found',
      });
    }

    if (!conversation.shareId) {
      conversation.shareId = crypto.randomUUID();
    }

    conversation.isShared = true;

    await conversation.save();

    return res.json({
      success: true,
      shareId: conversation.shareId,
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/share/${conversation.shareId}`,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getSharedConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      shareId: req.params.shareId,
      isShared: true,
    });

    if (!conversation) {
      return res.status(404).json({
        message: 'Shared conversation not found',
      });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    return res.json({
      conversation,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};