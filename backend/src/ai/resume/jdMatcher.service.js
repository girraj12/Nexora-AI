import groq from '../../config/openai.js';
import { JD_MATCHER_PROMPT } from './jdMatcherPrompts.js';

const normalizeScore = (score) => {
  if (score === undefined || score === null) return 0;

  if (typeof score === 'string') {
    const match = score.match(/\d+/);
    score = match ? Number(match[0]) : 0;
  }

  score = Number(score);

  if (Number.isNaN(score)) return 0;

  if (score > 0 && score <= 10) {
    return Math.round(score * 10);
  }

  return Math.min(Math.max(Math.round(score), 0), 100);
};

export const matchResumeWithJD = async ({
  resumeText,
  jobDescription,
  targetRole = 'General',
}) => {
  try {
    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error('Resume content too short');
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      throw new Error('Job description too short');
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'system',
          content: JD_MATCHER_PROMPT,
        },
        {
          role: 'user',
          content: `
Target Role:
${targetRole}

Resume:
${resumeText}

Job Description:
${jobDescription}
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
      matchScore: normalizeScore(parsed.matchScore),
      targetRole: parsed.targetRole || targetRole,
      summary: parsed.summary || '',
      strongMatches: parsed.strongMatches || [],
      missingSkills: parsed.missingSkills || [],
      weakAreas: parsed.weakAreas || [],
      resumeImprovements: parsed.resumeImprovements || [],
      atsKeywordsToAdd: parsed.atsKeywordsToAdd || [],
      interviewFocusAreas: parsed.interviewFocusAreas || [],
      finalVerdict: parsed.finalVerdict || '',
    };
  } catch (error) {
    console.error('JD match error:', error);

    return {
      matchScore: 0,
      targetRole,
      summary: 'JD matching failed',
      strongMatches: [],
      missingSkills: [],
      weakAreas: [],
      resumeImprovements: [],
      atsKeywordsToAdd: [],
      interviewFocusAreas: [],
      finalVerdict: 'Could not match resume with JD',
    };
  }
};