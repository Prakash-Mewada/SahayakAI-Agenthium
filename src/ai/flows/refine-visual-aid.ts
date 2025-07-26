'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RefineVisualAidInputSchema = z.object({
  originalPrompt: z.object({
    topic: z.string(),
    context: z.string().optional(),
    visualType: z.enum(['Diagram', 'Infographic', 'Chart', 'Presentation']),
    style: z.enum(['Minimalist', 'Bold', 'Elegant']),
    language: z.string().optional(),
    gradeLevel: z.string().optional(),
    curriculum: z.string().optional(),
  }),
  originalImageDataUri: z.string().describe('The data URI of the original image to be refined.'),
  refinements: z.array(z.string()).describe('A list of selected suggestions to apply.'),
});
export type RefineVisualAidInput = z.infer<typeof RefineVisualAidInputSchema>;

const RefineVisualAidOutputSchema = z.object({
  imageDataUri: z.string().describe('The refined visual aid image as a data URI.'),
  altText: z.string().describe('A descriptive alt text for the refined image.'),
});
export type RefineVisualAidOutput = z.infer<typeof RefineVisualAidOutputSchema>;

export async function refineVisualAid(input: RefineVisualAidInput): Promise<RefineVisualAidOutput> {
  const promptParts = [
    `You are an expert visual designer for educational content. An existing visual aid needs refinement based on specific feedback.`,
    `Original Topic: ${input.originalPrompt.topic}`,
    `Visual Type: ${input.originalPrompt.visualType}`,
    `Style: ${input.originalPrompt.style}`,
    `Now, regenerate the visual, applying the following refinements: ${input.refinements.join(', ')}`,
    `Ensure the new visual is a clear improvement over the original, incorporating the requested changes while maintaining the core educational concept.`,
  ];

  if (input.originalPrompt.context) {
    promptParts.push(`Original Context: ${input.originalPrompt.context}`);
  }

  const generationPrompt = [
    { text: promptParts.join('\n') },
    { media: { url: input.originalImageDataUri } },
    { text: 'The attached image is the original version. Create a new one based on the refinements.'}
  ];

  const { media } = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: generationPrompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  if (!media) {
    throw new Error('Image refinement failed.');
  }

  const altText = await ai.generate({
    prompt: `Generate a concise and descriptive alt text for an image about: ${input.originalPrompt.topic}, refined with the suggestions: ${input.refinements.join(', ')}`,
  });

  return {
    imageDataUri: media.url,
    altText: altText.text,
  };
}
