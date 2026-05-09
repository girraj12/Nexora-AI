import redisClient from '../config/redis.js';

const GUEST_EXPIRY_SECONDS = 24 * 60 * 60;

export const getGuestMessages = async (guestId) => {
  const key = `guest:${guestId}:messages`;

  const data = await redisClient.get(key);

  return data ? JSON.parse(data) : [];
};

export const saveGuestMessages = async (guestId, messages) => {
  const key = `guest:${guestId}:messages`;

  await redisClient.setEx(
    key,
    GUEST_EXPIRY_SECONDS,
    JSON.stringify(messages)
  );
};

export const addGuestMessage = async (guestId, message) => {
  const messages = await getGuestMessages(guestId);

  messages.push({
    ...message,
    createdAt: new Date().toISOString(),
  });

  await saveGuestMessages(guestId, messages);

  return messages;
};

export const deleteGuestMessages = async (guestId) => {
  const key = `guest:${guestId}:messages`;

  await redisClient.del(key);
};