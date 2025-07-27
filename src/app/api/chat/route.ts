// src/app/api/chat/route.ts
import { generateResponse, GenerateResponseInput } from '@/ai/flows/generate-response';
import { GenkitStream, GoogleAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: GenerateResponseInput['history'] };

    const stream = await generateResponse({ history: messages });
  
    // @ts-ignore
    const genkitStream = GenkitStream(stream, {
        onStart: async () => {
            console.log("Stream started");
        },
        onCompletion: async (completion: string) => {
            console.log("Stream completed", completion);
        },
        onFinal: async (completion: string) => {
            console.log("Stream finalized", completion);
        }
    });

    return new StreamingTextResponse(genkitStream);

  } catch (error: any) {
    return new Response(
        `## Error\n\n\`\`\`\n${error.message}\n\`\`\``,
        {
          status: 500,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        }
      );
  }
}
