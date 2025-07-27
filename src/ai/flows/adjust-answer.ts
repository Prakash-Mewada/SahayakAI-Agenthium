'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const AdjustAnswerInputSchema = z.object({
  answer: z.string().describe("The AI's answer to be adjusted."),
  action: z.enum(['expand', 'simplify']).describe('The adjustment action to perform.'),
});
export type AdjustAnswerInput = z.infer<typeof AdjustAnswerInputSchema>;

export const AdjustAnswerOutputSchema = z.object({
  adjustedAnswer: z.string().describe('The adjusted, new answer.'),
});
export type AdjustAnswerOutput = z.infer<typeof AdjustAnswerOutputSchema>;

export async function adjustAnswer(input: AdjustAnswerInput): Promise<AdjustAnswerOutput> {
  return adjustAnswerFlow(input);
}

const prompt = `You are an AI assistant that helps refine answers. A user will provide an existing answer and an action ('expand' or 'simplify'). You must rewrite the answer based on the requested action.

- If the action is 'expand', provide a more detailed and comprehensive version of the answer, adding relevant examples, context, or depth.
- If the action is 'simplify', provide a more concise and easy-to-understand version, using simpler language and focusing on the core concepts.

Original Answer:
{{{answer}}}

Action: {{{action}}}

Your rewritten, adjusted answer:
`;

const adjustAnswerFlow = ai.defineFlow(
  {
    name: 'adjustAnswerFlow',
    inputSchema: AdjustAnswerInputSchema,
    outputSchema: AdjustAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt,
      model: 'googleai/gemini-1.5-flash',
      input,
      output: {
        schema: AdjustAnswerOutputSchema,
      },
      config: {
        temperature: 0.5,
      },
    });

    return output!;
  }
);
