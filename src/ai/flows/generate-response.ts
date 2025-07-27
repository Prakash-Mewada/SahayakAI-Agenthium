'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { streamFlow } from '@genkit-ai/next/server';

const GenerateResponseInputSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
});
export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

export async function generateResponse(input: GenerateResponseInput) {
    return streamFlow(generateResponseFlow, input);
}

const prompt = `You are EduGenius, an expert AI assistant for teachers. Your goal is to provide accurate, helpful, and concise answers to questions related to education, lesson planning, classroom activities, and general knowledge.

You will be given the conversation history. Use it to provide a relevant and contextual response.

Conversation History:
{{#each history}}
- {{role}}: {{{content}}}
{{/each}}

Your Response:
`;

const generateResponseFlow = ai.defineFlow(
  {
    name: 'generateResponseFlow',
    inputSchema: GenerateResponseInputSchema,
    outputSchema: z.string(),
    stream: true,
  },
  async (input) => {

    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-1.5-flash',
      history: input.history.map(m => ({...m, content: [{text: m.content}]})),
      config: {
        temperature: 0.7,
      },
      stream: true
    });
    
    return llmResponse.stream();
  }
);