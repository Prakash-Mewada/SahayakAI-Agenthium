// The AI flow that generates a conversational response.

'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

interface Message {
    role: 'user' | 'model';
    content: string;
}

const GenerateResponseInputSchema = z.object({
  history: z.array(z.any()).describe('The conversation history.'),
});
export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

const GenerateResponseOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer.'),
});
export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

export async function generateResponse(
  input: GenerateResponseInput
): Promise<GenerateResponseOutput> {
  const llmResponse = await ai.generate({
    prompt: `You are an expert AI assistant for teachers named "Sahayak". Provide clear, concise, and jargon-free answers to their questions. Keep the tone friendly and supportive.
    
    Here is the conversation history:
    ${input.history.map((msg: Message) => `${msg.role}: ${msg.content}`).join('\n')}`,
    model: 'googleai/gemini-1.5-flash',
    output: {
        schema: GenerateResponseOutputSchema,
    },
    config: {
        temperature: 0.5
    }
  });

  return llmResponse.output as GenerateResponseOutput;
}
