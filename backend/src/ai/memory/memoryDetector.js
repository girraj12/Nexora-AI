import groq from '../../config/openai.js';

export const detectMemoryFromMessage = async ({ message, mode = 'general' }) => {
  try {
    if (!message || message.trim().length < 10) {
      return {
        shouldSave: false,
      };
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `
You are a memory extraction system.

Decide if the user's message contains useful long-term information about the user.

Save only things like:
- user profession
- skills
- goals
- preferences
- learning targets
- tech stack
- career interests
- project context

Do not save:
- random temporary questions
- passwords
- API keys
- private secrets
- short-term one-time info

Return ONLY valid JSON:
{
  "shouldSave": true/false,
  "content": "short memory sentence",
  "category": "profile|skill|preference|career|project|general"
}
`,
        },
        {
          role: 'user',
          content: `
Mode: ${mode}

User message:
${message}
`,
        },
      ],
    });
const raw =
  response.choices[0]?.message?.content || '{}';

const cleaned = raw
  .replace(/```json/g, '')
  .replace(/```/g, '')
  .trim();

const parsed = JSON.parse(cleaned);

return {
  shouldSave: Boolean(parsed.shouldSave),
  content: parsed.content || '',
  category: parsed.category || 'general',
};
  } catch (error) {
    console.error('Memory detection error:', error.message);

    return {
      shouldSave: false,
    };
  }
};