
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ContentPartSchema = z.object({
  text: z.string().optional(),
});

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(ContentPartSchema),
});
export type Message = z.infer<typeof MessageSchema>;

const GenerateRagBasedResponseInputSchema = z.object({
  history: z.array(MessageSchema),
});
export type GenerateRagBasedResponseInput = z.infer<typeof GenerateRagBasedResponseInputSchema>;

const GenerateRagBasedResponseOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer based on the conversation history.'),
});
export type GenerateRagBasedResponseOutput = z.infer<typeof GenerateRagBasedResponseOutputSchema>;


export async function generateRagBasedResponse(input: GenerateRagBasedResponseInput): Promise<GenerateRagBasedResponseOutput> {
    return generateRagBasedResponseFlow(input);
}

const generateRagBasedResponseFlow = ai.defineFlow(
    {
        name: 'generateRagBasedResponseFlow',
        inputSchema: GenerateRagBasedResponseInputSchema,
        outputSchema: GenerateRagBasedResponseOutputSchema,
    },
    async (input) => {
        const lastUserMessage = input.history[input.history.length - 1];
        const userQuery = lastUserMessage?.content.find(c => c.text)?.text || '';

        const systemPrompt = `You are an expert AI assistant for teachers called "Sahayak". Your goal is to provide concise, accurate, and teacher-friendly answers based on the user's question. Focus on educational topics.`;

        const llmResponse = await ai.generate({
            prompt: userQuery,
            model: 'googleai/gemini-1.5-flash',
            history: input.history,
            system: systemPrompt,
        });

        return {
            answer: llmResponse.text,
        };
    }
);
