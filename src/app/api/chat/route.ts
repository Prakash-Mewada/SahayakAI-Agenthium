// src/app/api/chat/route.ts
import { generateResponse, GenerateResponseInput } from '@/ai/flows/generate-response';
import { StreamingTextResponse } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: GenerateResponseInput['history'] };

    const stream = await generateResponse({ history: messages });
  
    return new StreamingTextResponse(stream);

  } catch (error: any) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
        `## Error\n\n\`\`\`\n${message}\n\`\`\``,
        {
          status: 500,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        }
      );
  }
}
