import groq from '../config/openai.js';

export const generateAIResponseFromText = async (documentText, question) => {
  const limitedText = documentText.slice(0, 12000);

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',

    messages: [
      {
        role: 'system',
        content:
          'You are Trinetra AI. Answer only using the provided document context. If answer is not available in the document, say that the document does not contain this information.',
      },
      {
        role: 'user',
        content: `
Document Context:
${limitedText}

Question:
${question}
        `,
      },
    ],
  });

  return completion.choices[0].message.content;
};