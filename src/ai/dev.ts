
import { config } from 'dotenv';
config();

import '@/ai/flows/improve-educational-content.ts';
import '@/ai/flows/generate-educational-content.ts';
import '@/ai/flows/generate-worksheet.ts';
import '@/ai/flows/get-worksheet-suggestions.ts';
import '@/ai/flows/generate-visual-aid.ts';
import '@/ai/flows/get-visual-aid-suggestions.ts';
import '@/ai/flows/refine-visual-aid.ts';
import '@/ai/flows/generate-image';
import '@/ai/flows/generate-rag-response';
