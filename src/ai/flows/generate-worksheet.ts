// The AI flow that generates a worksheet based on user input.

'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MultipleChoiceQuestionSchema = z.object({
  type: z.string().describe('The type of question, which is "multiple-choice".'),
  question: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
  explanation: z.string().optional().describe('A brief, one-line explanation for the answer if needed.'),
});

const FillInTheBlanksQuestionSchema = z.object({
  type: z.string().describe('The type of question, which is "fill-in-the-blanks".'),
  question: z.string().describe("The sentence with a blank, represented by '___'."),
  answer: z.string(),
  explanation: z.string().optional().describe('A brief, one-line explanation for the answer if needed.'),
});

const ShortAnswerQuestionSchema = z.object({
  type: z.string().describe('The type of question, which is "short-answer".'),
  question: z.string(),
  answer: z.string(),
  explanation: z.string().optional().describe('A brief, one-line explanation for the answer if needed.'),
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
  imageDataUri: z
    .string()
    .optional()
    .describe(
      "An optional image of the worksheet topic, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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
  const promptParts = [
    `Generate a ${input.worksheetType} worksheet with ${input.questionCount} questions about "${input.topic}".
    The difficulty should be ${input.difficulty}.
    The language should be ${input.language}.
    ${input.curriculum ? `Follow the ${input.curriculum} curriculum.` : ''}`,
  ];

  if (input.imageDataUri) {
    promptParts.push('Use the following image as context for the worksheet.');
    promptParts.push({ media: { url: input.imageDataUri } });
  }

  promptParts.push(
    'Provide a title for the worksheet and the questions in the specified format. If an answer requires an explanation, provide a brief, one-line explanation.'
  );

  const llmResponse = await ai.generate({
    prompt: promptParts.join('\n'),
    model: 'googleai/gemini-1.5-flash',
    output: {
      schema: GenerateWorksheetOutputSchema,
    },
    config: {
      temperature: 0.8,
    },
  });

  return llmResponse.output as GenerateWorksheetOutput;
}
