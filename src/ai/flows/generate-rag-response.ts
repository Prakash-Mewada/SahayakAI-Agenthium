
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MediaPartSchema = z.object({
  url: z.string().describe("The data URI of the media. Must include a MIME type and be Base64 encoded. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

const ContentPartSchema = z.object({
  text: z.string().optional(),
  media: MediaPartSchema.optional(),
});

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(ContentPartSchema),
});
export type Message = z.infer<typeof MessageSchema>;

const GenerateRagBasedResponseInputSchema = z.object({
  history: z.array(MessageSchema),
  imageDataUri: z.string().optional(),
});
export type GenerateRagBasedResponseInput = z.infer<typeof GenerateRagBasedResponseInputSchema>;

const GenerateRagBasedResponseOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer based on the provided context and history.'),
  retrievedContext: z.string().describe('The context that was retrieved to help generate the answer.'),
});
export type GenerateRagBasedResponseOutput = z.infer<typeof GenerateRagBasedResponseOutputSchema>;

// Mock RAG retriever function
async function retrieveContext(query: string): Promise<string> {
    // In a real application, this would query a vector database.
    // For this example, we'll return a static, relevant piece of educational content.
    console.log(`Retrieving context for query: "${query}"`);
    return `
      Photosynthesis is a process used by plants, algae, and certain bacteria to convert light energy into chemical energy,
      through a process that converts carbon dioxide and water into glucose (a sugar) and oxygen.
      The overall chemical equation for photosynthesis is: 6CO2 + 6H2O + Light Energy → C6H12O6 + 6O2.
      This process is crucial for life on Earth as it produces most of the oxygen in the atmosphere.
    `;
}

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

        const context = await retrieveContext(userQuery);

        const promptParts = [
            `You are an expert AI assistant for teachers called "Sahayak". Your goal is to provide concise, accurate, and teacher-friendly answers.`,
            `Use the following retrieved context to answer the user's question. If the context is not relevant, rely on your general knowledge but mention that the provided context was not applicable.`,
            `\n---\nRetrieved Context:\n${context}\n---\n`,
            `\n---\nConversation History:\n`,
            ...input.history.map(msg => `${msg.role}: ${msg.content.map(c => c.text || '(image)').join(' ')}`),
            `\n---\n`,
            `Based on the context and history, provide a summarized answer to the last user message.`
        ];
        
        const llmResponse = await ai.generate({
            prompt: promptParts.join('\n'),
            model: 'googleai/gemini-1.5-flash',
        });
        
        return {
            answer: llmResponse.text,
            retrievedContext: context,
        };
    }
);
