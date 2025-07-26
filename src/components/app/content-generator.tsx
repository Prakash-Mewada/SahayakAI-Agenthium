'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { Mic, Loader2, Copy, Share2, Save, Download } from 'lucide-react';
import { handleGenerateContent, generateDocx } from '@/app/actions';
import type { HistoryItem } from '@/services/content-history';
import jsPDF from 'jspdf';


// Define Zod schema for form validation
const formSchema = z.object({
  contentIdea: z.string().min(10, {
    message: 'Please provide a more detailed content idea (at least 10 characters).',
  }),
  contentType: z.enum(['Story', 'Concept', 'Analogy', 'Lesson', 'Example'], {
    required_error: 'You need to select a content type.',
  }),
  length: z.enum(['Short', 'Medium', 'Large'], {
    required_error: 'You need to select a length for the content.',
  }),
  language: z.string({
    required_error: 'Please select a language.',
  }),
});
type FormData = z.infer<typeof formSchema>;

// Data for form fields
const languages = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Kannada', label: 'Kannada' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
];

const contentTypes = [
  { id: 'Story', label: 'Story', description: 'Generates a narrative to explain the concept.' },
  { id: 'Concept', label: 'Concept', description: 'Provides a direct explanation of the topic.' },
  { id: 'Analogy', label: 'Analogy', description: 'Creates a comparison to a familiar idea.' },
  { id: 'Lesson', label: 'Lesson', description: 'Creates an educational lesson plan.' },
  { id: 'Example', label: 'Example', description: 'Provides an example of the concept.' },
];

const lengths = [
    { id: 'Short', label: 'Short' },
    { id: 'Medium', label: 'Medium' },
    { id: 'Large', label: 'Large' },
]

// SpeechRecognition types for browsers
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}
declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

function formatContent(text: string) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  html = html.replace(/\n/g, '<br />');

  return html;
}

export function ContentGenerator() {
  const { toast } = useToast();
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentIdea: '',
      contentType: 'Concept',
      length: 'Medium',
      language: 'English',
    },
  });

  // Effect to initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          const currentVal = form.getValues('contentIdea');
          form.setValue('contentIdea', (currentVal ? currentVal + ' ' : '') + transcript.trim());
        }
      };

      recognition.onerror = (event) => {
        toast({
          variant: 'destructive',
          title: 'Speech Recognition Error',
          description: `Error: ${event.error}`,
        });
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);
      
      recognitionRef.current = recognition;
    }
  }, [form, toast]);

  const toggleListen = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: 'Speech recognition is not supported in your browser.',
      });
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      const selectedLang = languages.find(l => l.value === form.getValues('language'))?.value || 'en-US';
      recognition.lang = selectedLang;
      recognition.start();
    }
    setIsListening(!isListening);
  };
  
  // Form submission handler
  const onSubmit = async (data: FormData) => {
    setIsGenerating(true);
    setGeneratedContent('');
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));

    const result = await handleGenerateContent(null, formData);

    if (result.success && result.data) {
      setGeneratedContent(result.data.generatedContent);
      handleAddToLibrary(result.data.generatedContent, true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: result.error,
      });
    }
    setIsGenerating(false);
  };

  const handleAddToLibrary = (content: string, silent = false) => {
    try {
      const newItem: HistoryItem = {
        id: new Date().toISOString(),
        content,
        date: new Date().toISOString(),
      };
      const savedContent = JSON.parse(localStorage.getItem('eduGeniusLibrary') || '[]') as HistoryItem[];
      savedContent.unshift(newItem);
      localStorage.setItem('eduGeniusLibrary', JSON.stringify(savedContent.slice(0, 50)));
      if (!silent) {
        toast({ title: 'Content added to library!' });
      }
    } catch (e) {
      if (!silent) {
        toast({ variant: 'destructive', title: 'Failed to add to library' });
      }
    }
  };

  // Handlers for output actions
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
      .then(() => toast({ title: 'Copied to clipboard!' }))
      .catch(() => toast({ variant: 'destructive', title: 'Failed to copy' }));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'EduGenius Content', text: generatedContent });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error sharing content' });
      }
    } else {
      toast({ variant: 'destructive', title: 'Share API not supported on this browser' });
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const contentHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${formatContent(generatedContent)}</div>`;

    doc.html(contentHtml, {
        callback: function (doc) {
            doc.save("EduGenius_Content.pdf");
            toast({ title: 'Downloading PDF...' });
        },
        x: 10,
        y: 10,
        width: 180,
        windowWidth: 800
    });
  };

  const handleDownloadDOC = async () => {
    try {
        toast({ title: 'Generating DOC file...' });
        const result = await generateDocx(formatContent(generatedContent));

        if (result.success && result.data) {
            const blob = new Blob([Buffer.from(result.data, 'base64')], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'EduGenius_Content.docx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: 'Downloading DOC...' });
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate DOC file.';
        toast({ variant: 'destructive', title: 'Failed to generate DOC file.', description: errorMessage });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader><CardTitle>Content Details</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="contentIdea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Idea</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea placeholder="e.g., Explain photosynthesis to a 5th grader" className="resize-none pr-12" rows={5} {...field} />
                          <TooltipProvider><Tooltip>
                              <TooltipTrigger asChild>
                                  <Button type="button" size="icon" variant={isListening ? 'destructive' : 'outline'} onClick={toggleListen} className="absolute bottom-2 right-2 h-8 w-8">
                                      <Mic className="h-4 w-4" />
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent>{isListening ? 'Stop listening' : 'Start listening'}</TooltipContent>
                          </Tooltip></TooltipProvider>
                        </div>
                      </FormControl>
                      <FormDescription>Describe the topic. You can type or use the microphone.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a content format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contentTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <TooltipProvider><Tooltip>
                                  <TooltipTrigger asChild><p>{type.label}</p></TooltipTrigger>
                                  <TooltipContent side="right"><p>{type.description}</p></TooltipContent>
                              </Tooltip></TooltipProvider>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Length</FormLabel>
                      <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-2">
                            {lengths.map((length) => (
                              <FormItem key={length.id}>
                                <FormControl><RadioGroupItem value={length.id} id={length.id} className="sr-only peer" /></FormControl>
                                <FormLabel htmlFor={length.id} className="flex h-12 flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 text-center hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors">
                                  {length.label}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a language" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {languages.map(lang => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isGenerating} className="w-full !mt-8">
                  {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Generate Content'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="flex flex-col lg:col-span-3">
          <Card className="flex h-full flex-col shadow-lg">
            <CardHeader><CardTitle>Generated Content</CardTitle></CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-full rounded-md border bg-muted/30 p-4">
                {isGenerating ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : generatedContent ? (
                  <div className="text-sm" dangerouslySetInnerHTML={{ __html: formatContent(generatedContent) }} />
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                    <p>Your generated educational content will appear here.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            {generatedContent && !isGenerating && (
              <CardFooter className="flex justify-end gap-2">
                <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={handleCopy}><Copy className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Copy</TooltipContent></Tooltip></TooltipProvider>
                <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={handleShare}><Share2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Share</TooltipContent></Tooltip></TooltipProvider>
                <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => handleAddToLibrary(generatedContent)}><Save className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Add to Library</TooltipContent></Tooltip></TooltipProvider>
                <DropdownMenu>
                  <TooltipProvider><Tooltip><TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                  </TooltipTrigger><TooltipContent>Download</TooltipContent></Tooltip></TooltipProvider>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleDownloadDOC}>Download as DOC</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadPDF}>Download as PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
