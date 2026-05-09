import groq from '../../config/openai.js';
import Message from '../../models/Message.js';

import { getModePrompt } from '../prompts/modePrompts.js';

import { buildMemoryContext } from '../memory/memory.service.js';

import { getRagContext } from '../rag/rag.service.js';

import { getLiveSearchContext } from '../search/search.service.js';

export const generateAIStreamWithOrchestrator = async ({
  conversationId,
  userMessage,
  userId = null,
  mode = 'general',
  customContextMessages = null,
}) => {
  let contextMessages = [];

  if (customContextMessages) {
    contextMessages = customContextMessages
      .slice(-10)
      .map((msg) => ({
        role:
          msg.sender === 'user'
            ? 'user'
            : 'assistant',

        content: msg.content,
      }));
  } else if (conversationId) {
    const previousMessages =
      await Message.find({
        conversationId,
      })
        .sort({ createdAt: -1 })
        .limit(10);

    contextMessages = previousMessages
      .reverse()
      .map((msg) => ({
        role:
          msg.sender === 'user'
            ? 'user'
            : 'assistant',

        content: msg.content,
      }));
  }

  const modePrompt =
    getModePrompt(mode);

  const memoryContext = userId
    ? await buildMemoryContext(userId)
    : '';

  const ragContext =
    await getRagContext({
      mode,
      query: userMessage,
      userId,
    });

  const liveSearchContext =
    await getLiveSearchContext({
      mode,
      query: userMessage,
    });

  const finalSystemPrompt = `
${modePrompt}

${memoryContext}

${ragContext}

${liveSearchContext}

Rules:
- Strongly use user memories while answering.
- Personalize answers according to the user's skills, goals and tech stack.
- Mention relevant technologies from memory naturally.
- Be practical.
- Give concise useful answers.
- If coding related, provide clean code.
- If market related, explain risks

`,

  const stream =
    await groq.chat.completions.create({
      model:
        'llama-3.3-70b-versatile',

      stream: true,

      messages: [
        {
          role: 'system',
          content: finalSystemPrompt,
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