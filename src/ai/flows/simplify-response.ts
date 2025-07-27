// The AI flow that simplifies a given text.

'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SimplifyResponseInputSchema = z.object({
  textToSimplify: z.string().describe('The text to be made simpler.'),
});
export type SimplifyResponseInput = z.infer<typeof SimplifyResponseInputSchema>;

const SimplifyResponseOutputSchema = z.object({
  simplifiedText: z.string().describe('The simplified version of the text.'),
});
export type SimplifyResponseOutput = z.infer<typeof SimplifyResponseOutputSchema>;

export async function simplifyResponse(
  input: SimplifyResponseInput
): Promise<SimplifyResponseOutput> {
  const llmResponse = await ai.generate({
    prompt: `You are an expert in simplifying complex topics for teachers. A user has requested a simpler version of the following text. Rewrite it to be clearer, more concise, and easier to understand, while retaining the core meaning.
    
    Text to simplify:
    "${input.textToSimplify}"`,
    model: 'googleai/gemini-1.5-flash',
    output: {
        schema: SimplifyResponseOutputSchema,
    },
  });

  return llmResponse.output as SimplifyResponseOutput;
}
