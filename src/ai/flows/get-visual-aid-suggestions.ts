'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetVisualAidSuggestionsInputSchema = z.object({
  topic: z.string().describe('The topic of the visual aid.'),
  visualType: z.string().describe('The type of visual aid.'),
  imageDataUri: z.string().describe('The data URI of the generated visual aid to be refined.'),
});
export type GetVisualAidSuggestionsInput = z.infer<typeof GetVisualAidSuggestionsInputSchema>;

const GetVisualAidSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of smart improvement tips and tags.'),
});
export type GetVisualAidSuggestionsOutput = z.infer<typeof GetVisualAidSuggestionsOutputSchema>;

export async function getVisualAidSuggestions(
  input: GetVisualAidSuggestionsInput
): Promise<GetVisualAidSuggestionsOutput> {
  const llmResponse = await ai.generate({
    prompt: [
        {text: `You are an expert design critic for educational materials. Given the topic "${input.topic}" and the visual type "${input.visualType}", analyze the following image and provide 3-5 concise, actionable suggestions for improvement. These suggestions could be about layout, clarity, font usage, color scheme, or adding/removing elements. Frame them as "tips" or "tags".`},
        {media: {url: input.imageDataUri}}
    ],
    model: 'googleai/gemini-1.5-flash',
    output: {
      schema: GetVisualAidSuggestionsOutputSchema,
    },
  });

  return llmResponse.output as GetVisualAidSuggestionsOutput;
}
