'use server';

/**
 * @fileOverview An AI agent that generates responses based on Retrieval-Augmented Generation (RAG).
 *
 * - generateRagBasedResponse - A function that generates a RAG-based response to a user question.
 * - GenerateRagBasedResponseInput - The input type for the generateRagBasedResponse function.
 * - GenerateRagBasedResponseOutput - The return type for the generateRagBasedResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRagBasedResponseInputSchema = z.object({
  question: z.string().describe('The user question.'),
});
export type GenerateRagBasedResponseInput = z.infer<typeof GenerateRagBasedResponseInputSchema>;

const GenerateRagBasedResponseOutputSchema = z.object({
  answer: z.string().describe('The RAG-based answer to the user question.'),
});
export type GenerateRagBasedResponseOutput = z.infer<typeof GenerateRagBasedResponseOutputSchema>;

export async function generateRagBasedResponse(input: GenerateRagBasedResponseInput): Promise<GenerateRagBasedResponseOutput> {
  return generateRagBasedResponseFlow(input);
}

const ragPrompt = ai.definePrompt({
  name: 'ragPrompt',
  input: {schema: GenerateRagBasedResponseInputSchema},
  output: {schema: GenerateRagBasedResponseOutputSchema},
  prompt: `You are an expert AI assistant specializing in education. Your purpose is to help users with a variety of educational tasks.

You can:
- Answer questions on a wide range of academic subjects.
- Help plan and arrange study schedules, lesson plans, and educational activities.
- Assist with scheduling meetings and appointments related to educational matters.
- Provide explanations, examples, and summaries of complex topics.

Use your expertise and any provided context to give a comprehensive, helpful, and accurate response to the user's question.

Question: {{{question}}}`,
});

const generateRagBasedResponseFlow = ai.defineFlow(
  {
    name: 'generateRagBasedResponseFlow',
    inputSchema: GenerateRagBasedResponseInputSchema,
    outputSchema: GenerateRagBasedResponseOutputSchema,
  },
  async input => {
    const {output} = await ragPrompt(input);
    return output!;
  }
);