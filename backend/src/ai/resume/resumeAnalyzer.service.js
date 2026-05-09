import groq from '../../config/openai.js';
import { RESUME_ANALYZER_PROMPT } from './resumePrompts.js';

export const analyzeResume = async ({
  resumeText,
targetRole = 'General'
}) => {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: RESUME_ANALYZER_PROMPT,
        },
        {
          role: 'user',
          content: `
Target Role:
${targetRole}

Resume:
${resumeText}
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

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Resume analyze error:', error);

    return {
      atsScore: 0,
      summary: 'Resume analysis failed',
      strengths: [],
      weaknesses: [],
      missingSkills: [],
      improvements: [],
      recommendedProjects: [],
      finalVerdict: 'Could not analyze resume',
    };
  }
};