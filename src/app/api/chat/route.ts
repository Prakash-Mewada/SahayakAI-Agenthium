
// src/app/api/chat/route.ts
import { generateRagBasedResponse, GenerateRagBasedResponseInput } from '@/ai/flows/generate-rag-response';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { history, imageDataUri } = await req.json() as GenerateRagBasedResponseInput;
    
    const response = await generateRagBasedResponse({ history, imageDataUri });

    return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    const error = e instanceof Error ? e.message : "An unexpected error occurred.";
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
