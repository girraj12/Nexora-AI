import dotenv from 'dotenv';
dotenv.config();

import { createClient } from 'redis';

console.log('REDIS URL =>', process.env.REDIS_URL);

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
  console.log('Redis Error:', err);
});

await redisClient.connect();

console.log('Redis Connected');

export default redisClient;