// The AI flow that generates worksheet suggestions based on user input.

'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetWorksheetSuggestionsInputSchema = z.object({
  worksheetIdea: z
    .string()
    .describe('The initial idea or topic for the worksheet.'),
});
export type GetWorksheetSuggestionsInput = z.infer<typeof GetWorksheetSuggestionsInputSchema>;

const GetWorksheetSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of refined worksheet topics or ideas.'),
});
export type GetWorksheetSuggestionsOutput = z.infer<typeof GetWorksheetSuggestionsOutputSchema>;

export async function getWorksheetSuggestions(
  input: GetWorksheetSuggestionsInput
): Promise<GetWorksheetSuggestionsOutput> {
  const llmResponse = await ai.generate({
    prompt: `Given the worksheet idea "${input.worksheetIdea}", generate 3-5 more specific and refined topic suggestions. These suggestions should be creative and suitable for a classroom worksheet.`,
    model: 'googleai/gemini-1.5-flash',
    output: {
      schema: GetWorksheetSuggestionsOutputSchema,
    },
  });

  return llmResponse.output as GetWorksheetSuggestionsOutput;
}
