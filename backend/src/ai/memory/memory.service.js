import Memory from './memory.model.js';

export const getUserMemories = async (userId) => {
  if (!userId) return [];

  return Memory.find({ userId }).sort({ createdAt: -1 }).limit(20);
};

export const createMemory = async ({
  userId,
  content,
  category = 'general',
}) => {
  if (!userId || !content?.trim()) return null;

  const existingMemory = await Memory.findOne({
    userId,
    content: content.trim(),
  });

  if (existingMemory) {
    return existingMemory;
  }

  return Memory.create({
    userId,
    content: content.trim(),
    category,
  });
};

export const deleteMemory = async ({ userId, memoryId }) => {
  return Memory.deleteOne({
    _id: memoryId,
    userId,
  });
};

export const buildMemoryContext = async (userId) => {
  const memories = await getUserMemories(userId);

  if (!memories.length) return '';

  return `
User Memories:
${memories.map((m, index) => `${index + 1}. ${m.content}`).join('\n')}
`;
};