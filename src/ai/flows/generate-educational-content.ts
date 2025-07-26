// The AI flow that generates educational content based on user input.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getContentHistory } from '@/services/content-history';


const GenerateEducationalContentInputSchema = z.object({
  contentIdea: z.string().describe('The educational content idea provided by the teacher.'),
  contentType: z.enum(['Story', 'Concept', 'Analogy', 'Lesson', 'Example']).describe('The desired output format for the content.'),
  language: z.string().describe('The language in which the content should be generated.'),
  length: z.enum(['Short', 'Medium', 'Large']).describe('The desired length of the content.'),
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
    schema: z.object({
      contentIdea: z.string(),
      contentType: z.string(),
      language: z.string(),
      length: z.string(),
      history: z.array(z.string()),
    }),
  },
  output: {
    schema: GenerateEducationalContentOutputSchema,
  },
  prompt: `You are an AI tool designed to generate educational content for teachers. You will be provided with a content idea, a content type, a language, and a desired length.

  Use the provided history of previously generated content as context to improve your response and avoid repetition.

  Content Idea: {{{contentIdea}}}
  Content Type: {{{contentType}}}
  Length: {{{length}}}
  Language: {{{language}}}

  History:
  {{#each history}}
  - {{{this}}}
  {{/each}}

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
    const historyItems = await getContentHistory();
    const history = historyItems.map(item => item.content);
    
    const {output} = await generateEducationalContentPrompt({
      ...input,
      history,
    });
    return output!;
  }
);
