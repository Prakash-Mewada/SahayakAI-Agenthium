'use server';

/**
 * @fileOverview An AI agent to improve educational content by re-writing it in a selected format and language.
 *
 * - improveEducationalContent - A function that improves the educational content.
 * - ImproveEducationalContentInput - The input type for the improveEducationalContent function.
 * - ImproveEducationalContentOutput - The return type for the improveEducationalContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveEducationalContentInputSchema = z.object({
  existingContent: z
    .string()
    .describe('The existing educational content to improve.'),
  contentType: z
    .enum(['Story', 'Concept', 'Analogy'])
    .describe('The desired output format for the content.'),
  language: z.string().describe('The desired output language for the content.'),
});
export type ImproveEducationalContentInput = z.infer<
  typeof ImproveEducationalContentInputSchema
>;

const ImproveEducationalContentOutputSchema = z.object({
  improvedContent: z
    .string()
    .describe('The improved educational content in the selected format and language.'),
});
export type ImproveEducationalContentOutput = z.infer<
  typeof ImproveEducationalContentOutputSchema
>;

export async function improveEducationalContent(
  input: ImproveEducationalContentInput
): Promise<ImproveEducationalContentOutput> {
  return improveEducationalContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveEducationalContentPrompt',
  input: {schema: ImproveEducationalContentInputSchema},
  output: {schema: ImproveEducationalContentOutputSchema},
  prompt: `You are an expert educational content rewriter. A teacher will provide you with existing educational content, and you will re-write it into the format and language that they request.

Existing Content: {{{existingContent}}}
Content Type: {{{contentType}}}
Language: {{{language}}}

Rewrite the content in the specified format and language. Make sure to keep the educational value high. Be concise and to the point.`,
});

const improveEducationalContentFlow = ai.defineFlow(
  {
    name: 'improveEducationalContentFlow',
    inputSchema: ImproveEducationalContentInputSchema,
    outputSchema: ImproveEducationalContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
