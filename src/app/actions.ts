'use server';

import { z } from 'zod';
import {
  generateEducationalContent,
  type GenerateEducationalContentInput,
} from '@/ai/flows/generate-educational-content';
import htmlToDocx from 'html-to-docx';

const formSchema = z.object({
  contentIdea: z.string().min(10, {
    message: 'Content idea must be at least 10 characters.',
  }),
  contentType: z.enum(['Story', 'Concept', 'Analogy'], {
    required_error: 'You need to select a content type.',
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
    const contentHtml = `<!DOCTYPE html><html><head><title>EduGenius Content</title></head><body>${htmlContent.replace(/\n/g, '<br />')}</body></html>`;
    const fileBuffer = await htmlToDocx(contentHtml, undefined, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
    });

    return { success: true, data: (fileBuffer as Buffer).toString('base64') };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while generating the DOC file.';
    return { success: false, error: errorMessage };
  }
}
