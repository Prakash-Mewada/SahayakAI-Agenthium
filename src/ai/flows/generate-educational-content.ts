// The AI flow that generates educational content based on user input.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const GenerateEducationalContentInputSchema = z.object({
  contentIdea: z.string().describe('The educational content idea provided by the teacher.'),
  contentType: z.enum(['Story', 'Concept', 'Analogy']).describe('The desired output format for the content.'),
  language: z.string().describe('The language in which the content should be generated.'),
});

export type GenerateEducationalContentInput = z.infer<typeof GenerateEducationalContentInputSchema>;

const GenerateEducationalContentOutputSchema = z.object({
  generatedContent: z.string().describe('The generated educational content in the specified format and language.'),
});

export type GenerateEducationalContentOutput = z.infer<typeof GenerateEducationalContentOutputSchema>;

export async function generateEducationalContent(input: GenerateEducationalContentInput): Promise<GenerateEducationalContentOutput> {
  return generateEducationalContentFlow(input);
}

const generateEducationalContentPrompt = ai.definePrompt({
  name: 'generateEducationalContentPrompt',
  input: {
    schema: GenerateEducationalContentInputSchema,
  },
  output: {
    schema: GenerateEducationalContentOutputSchema,
  },
  prompt: `You are an AI tool designed to generate educational content for teachers. You will be provided with a content idea, a content type, and a language.

  Based on this, generate the appropriate educational content in the specified language.

  Content Idea: {{{contentIdea}}}
  Content Type: {{{contentType}}}
  Language: {{{language}}}

  Ensure the content is accurate, engaging, and suitable for students. Format the response nicely.
  `,
});

const generateEducationalContentFlow = ai.defineFlow(
  {
    name: 'generateEducationalContentFlow',
    inputSchema: GenerateEducationalContentInputSchema,
    outputSchema: GenerateEducationalContentOutputSchema,
  },
  async input => {
    const {output} = await generateEducationalContentPrompt(input);
    return output!;
  }
);
