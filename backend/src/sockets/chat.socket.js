import Message from '../models/Message.js';
import { generateAIStream } from '../services/ai.service.js';
import crypto from 'crypto';
import Conversation from '../models/Conversation.js';
import {
  addGuestMessage,
  getGuestMessages,
} from '../services/guest.service.js';
import { detectMemoryFromMessage } from '../ai/memory/memoryDetector.js';
import { createMemory } from '../ai/memory/memory.service.js';

const streamAIResponse = async (
  io,
  conversationId,
  message,
  guestId = null,
  guestContextMessages = null,
  mode = 'general'
) => {
  let finalAiReply = '';

  const stream = await generateAIStream(
    conversationId,
    message,
    guestContextMessages,
    mode
  );

  io.emit('ai_stream_start', {
    conversationId,
    sender: 'ai',
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content || '';

    if (token) {
      finalAiReply += token;

      io.emit('ai_stream_chunk', {
        conversationId,
        token,
      });
    }
  }

  if (guestId) {
    const aiMessage = {
      _id: crypto.randomUUID(),
      conversationId,
      sender: 'ai',
      content: finalAiReply,
    };

    await addGuestMessage(guestId, aiMessage);

    io.emit('ai_stream_end', {
      conversationId,
      message: aiMessage,
    });

    return;
  }

  const aiMessage = await Message.create({
    conversationId,
    sender: 'ai',
    content: finalAiReply,
  });

  io.emit('ai_stream_end', {
    conversationId,
    message: aiMessage,
  });
};

const registerSocket = (io, socket) => {
  socket.on('guest_load_messages', async (data) => {
    try {
      const { guestId } = data;

      const messages = await getGuestMessages(guestId);

      socket.emit('guest_messages_loaded', {
        messages,
      });
    } catch (error) {
      console.error('Guest Load Error:', error.message);
    }
  });

  socket.on('send_message', async (data) => {
    try {
    const { conversationId, message, guestId, mode = 'general' } = data;

      if (guestId) {
        const userMessage = {
          _id: crypto.randomUUID(),
          conversationId: 'guest-chat',
          sender: 'user',
          content: message,
        };

        const guestMessages = await addGuestMessage(guestId, userMessage);

        io.emit('receive_message', userMessage);

        io.emit('ai_typing', true);

        await streamAIResponse(
          io,
          'guest-chat',
          message,
          guestId,
          guestMessages,
          mode
        );

        io.emit('ai_typing', false);

        return;
      }

   const conversation = await Conversation.findById(conversationId);

   if (conversation?.userId) {
  const detectedMemory = await detectMemoryFromMessage({
    message,
    mode,
  });
  
  if (detectedMemory.shouldSave && detectedMemory.content) {
    await createMemory({
      userId: conversation.userId,
      content: detectedMemory.content,
      category: detectedMemory.category,
    });
  }
}

   if (
   conversation &&
   (!conversation.title || conversation.title === 'New Chat')
   ) {
    conversation.title =
    message.length > 35 ? message.slice(0, 35) + '...' : message;

    await conversation.save();

      io.emit('conversation_updated', conversation);
    }

     const userMessage = await Message.create({
     conversationId,
     sender: 'user',
     content: message,
     });

      io.emit('receive_message', userMessage);

      io.emit('ai_typing', true);

     await streamAIResponse(io, conversationId, message, null, null, mode);

      io.emit('ai_typing', false);
    } catch (error) {
      console.error('Socket AI Error:', error.message);

      io.emit('ai_typing', false);

      io.emit('receive_message', {
        sender: 'ai',
        content: 'Sorry, something went wrong while generating AI response.',
      });
    }
  });

  socket.on('edit_message', async (data) => {
    try {
      const { messageId, conversationId, newContent } = data;

      const oldMessage = await Message.findById(messageId);

      if (!oldMessage) {
        socket.emit('receive_message', {
          sender: 'ai',
          content: 'Message not found.',
        });
        return;
      }

      await Message.updateOne(
        { _id: messageId },
        {
          $set: {
            content: newContent,
          },
        }
      );

      await Message.deleteMany({
        conversationId,
        createdAt: {
          $gt: oldMessage.createdAt,
        },
      });

      const updatedMessages = await Message.find({
        conversationId,
      }).sort({ createdAt: 1 });

      io.emit('messages_updated', {
        conversationId,
        messages: updatedMessages,
      });

      io.emit('ai_typing', true);

      await streamAIResponse(io, conversationId, newContent);

      io.emit('ai_typing', false);
    } catch (error) {
      console.error('Edit Message Error:', error.message);

      io.emit('ai_typing', false);

      io.emit('receive_message', {
        sender: 'ai',
        content: 'Sorry, something went wrong while editing message.',
      });
    }
  });
};

export default registerSocket;