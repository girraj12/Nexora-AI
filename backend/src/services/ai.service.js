import groq from '../config/openai.js';
import Message from '../models/Message.js';
import { getSystemPromptByMode } from './ai.Prompts.js';

export const generateAIStream = async (
  conversationId,
  userMessage,
  customContextMessages = null,
  mode = 'general'
) => {
  let contextMessages = [];

  if (customContextMessages) {
    contextMessages = customContextMessages.slice(-10).map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
  } else {
    const previousMessages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(10);

    contextMessages = previousMessages.reverse().map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
  }

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    stream: true,
    messages: [
      {
        role: 'system',
        content: getSystemPromptByMode(mode),
      },
      ...contextMessages,
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  return stream;
};