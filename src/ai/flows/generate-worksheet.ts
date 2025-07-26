// The AI flow that generates a worksheet based on user input.

'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MultipleChoiceQuestionSchema = z.object({
  type: z.literal('multiple-choice'),
  question: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
});

const FillInTheBlanksQuestionSchema = z.object({
  type: z.literal('fill-in-the-blanks'),
  question: z.string().describe("The sentence with a blank, represented by '___'."),
  answer: z.string(),
});

const ShortAnswerQuestionSchema = z.object({
  type: z.literal('short-answer'),
  question: z.string(),
  answer: z.string(),
});

const GenerateWorksheetInputSchema = z.object({
  topic: z.string().describe('The subject or content for the worksheet.'),
  worksheetType: z
    .string()
    .describe(
      'The type of worksheet questions, e.g., Multiple Choice, Fill in the Blanks, Short Answer.'
    ),
  questionCount: z
    .number()
    .describe('The number of questions to generate.'),
  difficulty: z
    .string()
    .describe('The difficulty level of the questions (e.g., Easy, Medium, Hard).'),
  language: z.string().describe('The language for the worksheet.'),
  curriculum: z.string().optional().describe('The curriculum to follow, if any.'),
});
export type GenerateWorksheetInput = z.infer<typeof GenerateWorksheetInputSchema>;

const GenerateWorksheetOutputSchema = z.object({
  title: z.string().describe('The title of the worksheet.'),
  questions: z.array(
    z.union([
      MultipleChoiceQuestionSchema,
      FillInTheBlanksQuestionSchema,
      ShortAnswerQuestionSchema,
    ])
  ),
});
export type GenerateWorksheetOutput = z.infer<typeof GenerateWorksheetOutputSchema>;

export async function generateWorksheet(
  input: GenerateWorksheetInput
): Promise<GenerateWorksheetOutput> {
  const prompt = `Generate a ${input.worksheetType} worksheet with ${input.questionCount} questions about "${input.topic}".
    The difficulty should be ${input.difficulty}.
    The language should be ${input.language}.
    ${input.curriculum ? `Follow the ${input.curriculum} curriculum.` : ''}
    Provide a title for the worksheet and the questions in the specified format.`;

  const llmResponse = await ai.generate({
    prompt: prompt,
    model: 'googleai/gemini-1.5-flash',
    output: {
      schema: GenerateWorksheetOutputSchema,
    },
    config: {
      temperature: 0.8
    }
  });

  return llmResponse.output as GenerateWorksheetOutput;
}
