import groq from '../../config/openai.js';
import { BULLET_GENERATOR_PROMPT } from './bulletGeneratorPrompts.js';

export const generateBetterResumeBullets = async ({
  bullets,
  targetRole = 'General',
}) => {
  try {
    if (!bullets || bullets.trim().length < 10) {
      throw new Error('Bullet points are too short');
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'system',
          content: BULLET_GENERATOR_PROMPT,
        },
        {
          role: 'user',
          content: `
Target Role:
${targetRole}

Bullet Points:
${bullets}
`,
        },
      ],
    });

    const raw = response?.choices?.[0]?.message?.content || '{}';

    const cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      targetRole: parsed.targetRole || targetRole,
      summary: parsed.summary || '',
      improvedBullets: parsed.improvedBullets || [],
      atsKeywordsToUse: parsed.atsKeywordsToUse || [],
      finalTips: parsed.finalTips || [],
    };
  } catch (error) {
    console.error('Bullet generator error:', error);

    return {
      targetRole,
      summary: 'Bullet optimization failed',
      improvedBullets: [],
      atsKeywordsToUse: [],
      finalTips: ['Could not generate improved bullets.'],
    };
  }
};