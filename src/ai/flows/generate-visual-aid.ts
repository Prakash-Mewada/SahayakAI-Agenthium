'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateVisualAidInputSchema = z.object({
  topic: z.string().describe('The main topic or concept for the visual aid.'),
  context: z.string().optional().describe('Additional context, like textbook snippets or user notes.'),
  visualType: z.enum(['Diagram', 'Infographic', 'Chart', 'Presentation']).describe('The desired format for the visual aid.'),
  style: z.enum(['Minimalist', 'Bold', 'Elegant']).describe('The preferred visual style.'),
  language: z.string().optional().describe('The language for any text in the visual.'),
  gradeLevel: z.string().optional().describe('The target grade level for the content.'),
  curriculum: z.string().optional().describe('The curriculum to follow, if any.'),
  imageDataUri: z.string().optional().describe('An optional reference image as a data URI.'),
});
export type GenerateVisualAidInput = z.infer<typeof GenerateVisualAidInputSchema>;

const GenerateVisualAidOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated visual aid image as a data URI.'),
  altText: z.string().describe('A descriptive alt text for the generated image.'),
});
export type GenerateVisualAidOutput = z.infer<typeof GenerateVisualAidOutputSchema>;

export async function generateVisualAid(input: GenerateVisualAidInput): Promise<GenerateVisualAidOutput> {
  const promptParts = [
    `You are an expert visual designer for educational content. Create a high-quality visual aid based on the following specifications.`,
    `Topic: ${input.topic}`,
    `Visual Type: ${input.visualType}`,
    `Style: ${input.style}`,
    `The visual should be clear, accurate, and engaging for the target audience.`,
  ];

  if (input.context) {
    promptParts.push(`Use the following context to inform the design: ${input.context}`);
  }
  if (input.gradeLevel) {
    promptParts.push(`Target Grade Level: ${input.gradeLevel}`);
  }
  if (input.curriculum) {
    promptParts.push(`Curriculum: ${input.curriculum}`);
  }
  if (input.language) {
    promptParts.push(`Language for any text: ${input.language}`);
  }

  const generationPrompt = [
    { text: promptParts.join('\n') }
  ];

  if (input.imageDataUri) {
    generationPrompt.push({ media: { url: input.imageDataUri } });
    generationPrompt.push({ text: 'Use the attached image as a reference for style and content.' });
  }

  const { media } = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: generationPrompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  const altText = await ai.generate({
    prompt: `Generate a concise and descriptive alt text for an image about: ${input.topic}`,
  });


  if (!media) {
    throw new Error('Image generation failed.');
  }

  return {
    imageDataUri: media.url,
    altText: altText.text,
  };
}
