import dotenv from 'dotenv';
dotenv.config();

// import OpenAI from 'openai';

// console.log('OPENAI KEY =>', process.env.OPENAI_API_KEY);

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export default openai;

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;