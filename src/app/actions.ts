
'use server';

import { z } from 'zod';
import {
  generateEducationalContent,
  type GenerateEducationalContentInput,
} from '@/ai/flows/generate-educational-content';
import {
  generateWorksheet,
  type GenerateWorksheetInput,
  type GenerateWorksheetOutput,
} from '@/ai/flows/generate-worksheet';
import {
    getWorksheetSuggestions,
    type GetWorksheetSuggestionsInput,
} from '@/ai/flows/get-worksheet-suggestions';
import {
    generateVisualAid,
    type GenerateVisualAidInput,
    type GenerateVisualAidOutput,
} from '@/ai/flows/generate-visual-aid';
import {
    getVisualAidSuggestions,
    type GetVisualAidSuggestionsInput,
    type GetVisualAidSuggestionsOutput,
} from '@/ai/flows/get-visual-aid-suggestions';
import {
    refineVisualAid,
    type RefineVisualAidInput,
    type RefineVisualAidOutput,
} from '@/ai/flows/refine-visual-aid';
import htmlToDocx from 'html-to-docx';
import { generateImage, type GenerateImageInput, type GenerateImageOutput } from '@/ai/flows/generate-image';
import { generateResponse, type GenerateResponseInput } from '@/ai/flows/generate-response';
import { simplifyResponse, type SimplifyResponseInput } from '@/ai/flows/simplify-response';


const formSchema = z.object({
  contentIdea: z.string().min(10, {
    message: 'Content idea must be at least 10 characters.',
  }),
  contentType: z.enum(['Story', 'Concept', 'Analogy', 'Lesson', 'Example'], {
    required_error: 'You need to select a content type.',
  }),
  length: z.enum(['Short', 'Medium', 'Large'], {
    required_error: 'You need to select a length.',
  }),
  language: z.string({
    required_error: 'Please select a language.',
  }),
});

type ContentGenerationResult = 
    | { success: true; data: { generatedContent: string } }
    | { success: false; error: string };


export async function handleGenerateContent(
    prevState: any,
    formData: FormData
): Promise<ContentGenerationResult> {
  const validatedFields = formSchema.safeParse({
    contentIdea: formData.get('contentIdea'),
    contentType: formData.get('contentType'),
    length: formData.get('length'),
    language: formData.get('language'),
  });

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.issues.map(issue => issue.message).join(', ');
    return {
      success: false,
      error: errorMessages,
    };
  }

  try {
    const input: GenerateEducationalContentInput = validatedFields.data;
    const result = await generateEducationalContent(input);
    return { success: true, data: result };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred while generating content.';
    return { success: false, error: errorMessage };
  }
}

export async function generateDocx(htmlContent: string): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  try {
    const contentHtml = `<!DOCTYPE html><html><head><title>EduGenius Content</title></head><body>${htmlContent}</body></html>`;
    const fileBuffer = await htmlToDocx(contentHtml, undefined, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
    });

    return { success: true, data: (fileBuffer as Buffer).toString('base64') };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate DOC file.';
    return { success: false, error: errorMessage };
  }
}

export async function handleGetSuggestions(
    input: GetWorksheetSuggestionsInput
  ): Promise<{ suggestions: string[]; error?: string }> {
    try {
      const { suggestions } = await getWorksheetSuggestions(input);
      return { suggestions };
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      return { suggestions: [], error: errorMessage };
    }
}
  
export async function handleGenerateWorksheet(
    input: GenerateWorksheetInput
): Promise<{ worksheet?: GenerateWorksheetOutput; error?: string }> {
    try {
      const worksheet = await generateWorksheet(input);
      return { worksheet };
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      return { error: errorMessage };
    }
}

export async function handleGenerateVisualAid(
    input: GenerateVisualAidInput
  ): Promise<{ visualAid?: GenerateVisualAidOutput; error?: string }> {
    try {
      const visualAid = await generateVisualAid(input);
      return { visualAid };
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      return { error: errorMessage };
    }
}

export async function handleGetVisualAidSuggestions(
    input: GetVisualAidSuggestionsInput
  ): Promise<{ suggestions?: GetVisualAidSuggestionsOutput; error?: string }> {
    try {
      const suggestions = await getVisualAidSuggestions(input);
      return { suggestions };
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      return { error: errorMessage };
    }
}

export async function handleRefineVisualAid(
    input: RefineVisualAidInput
  ): Promise<{ visualAid?: RefineVisualAidOutput; error?: string }> {
    try {
      const visualAid = await refineVisualAid(input);
      return { visualAid };
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      return { error: errorMessage };
    }
}

export async function handleGenerateImage(
  input: GenerateImageInput
): Promise<{ image?: GenerateImageOutput; error?: string }> {
  try {
    const image = await generateImage(input);
    return { image };
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: errorMessage };
  }
}

export async function handleGenerateResponse(
    input: GenerateResponseInput
  ): Promise<{ answer?: string; error?: string }> {
    try {
      const { answer } = await generateResponse(input);
      return { answer };
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      return { error: errorMessage };
    }
}

export async function handleSimplifyResponse(
    input: SimplifyResponseInput
  ): Promise<{ simplifiedText?: string; error?: string }> {
    try {
      const { simplifiedText } = await simplifyResponse(input);
      return { simplifiedText };
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      return { error: errorMessage };
    }
}
