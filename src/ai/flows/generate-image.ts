'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt for image generation.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
  altText: z.string().describe('A descriptive alt text for the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  const { prompt } = input;

  const { media } = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  const altText = await ai.generate({
    prompt: `Generate a concise and descriptive alt text for an image based on the following prompt: ${prompt}`,
  });


  if (!media) {
    throw new Error('Image generation failed.');
  }

  return {
    imageDataUri: media.url,
    altText: altText.text,
  };
}
