
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { saveAs } from 'file-saver';
import {
  handleGenerateVisualAid,
  handleGetVisualAidSuggestions,
  handleRefineVisualAid,
  handleGenerateImage,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, Upload, Download, Share2, Lightbulb, Sparkles, X, FileText, Palette, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { GenerateVisualAidOutput } from '@/ai/flows/generate-visual-aid';
import type { GetVisualAidSuggestionsOutput } from '@/ai/flows/get-visual-aid-suggestions';
import { Skeleton } from '../ui/skeleton';

const visualAidSchema = z.object({
  topic: z.string().min(5, 'Please enter a topic.'),
  context: z.string().optional(),
  visualType: z.enum(['Diagram', 'Infographic', 'Chart', 'Presentation']),
  style: z.enum(['Minimalist', 'Bold', 'Elegant']),
  language: z.string().optional(),
  gradeLevel: z.string().optional(),
  curriculum: z.string().optional(),
  imageDataUri: z.string().optional(),
});

type VisualAidFormValues = z.infer<typeof visualAidSchema>;

const visualTypes = ['Diagram', 'Infographic', 'Chart', 'Presentation'];
const styles = ['Minimalist', 'Bold', 'Elegant'];

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

export function VisualAidCreator() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, startGeneration] = useTransition();
  const [isRefining, startRefinement] = useTransition();
  const [generatedVisual, setGeneratedVisual] = useState<GenerateVisualAidOutput | null>(null);
  const [suggestions, setSuggestions] = useState<GetVisualAidSuggestionsOutput['suggestions']>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isListening, setIsListening] = useState<'topic' | 'context' | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isHeroImageLoading, startHeroImageLoading] = useTransition();

  const form = useForm<VisualAidFormValues>({
    resolver: zodResolver(visualAidSchema),
    defaultValues: {
      topic: '',
      context: '',
      visualType: 'Diagram',
      style: 'Minimalist',
      language: 'English',
      gradeLevel: 'Middle School',
      curriculum: '',
    },
  });

  useEffect(() => {
    startHeroImageLoading(async () => {
      const { image, error } = await handleGenerateImage({ prompt: 'A beautiful collage of high-quality diagrams, infographics, charts, and presentations for educational content.' });
      if (error) {
        toast({ variant: 'destructive', title: 'Hero Image Failed', description: error });
        setHeroImage('https://placehold.co/1200x400.png');
      } else if (image) {
        setHeroImage(image.imageDataUri);
      }
    });
  }, [toast]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        if(silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
        }

        if (isListening) {
          const currentVal = form.getValues(isListening);
          form.setValue(isListening, (currentVal ? currentVal + ' ' : '') + transcript);
        }

        silenceTimerRef.current = setTimeout(() => {
            toggleListen(null);
        }, 2000);
      };
      recognition.onerror = (event) => {
        toast({ variant: 'destructive', title: 'Speech Recognition Error', description: event.error });
        setIsListening(null);
      }
      recognition.onend = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        setIsListening(null);
      };
      recognitionRef.current = recognition;
    }
  }, [form, toast, isListening]);

  const toggleListen = (field: 'topic' | 'context' | null) => {
    if (recognitionRef.current) {
        if (isListening === field && field !== null) {
            recognitionRef.current.stop();
        } else {
            if (isListening) recognitionRef.current.stop();
            if(field) {
                recognitionRef.current.start();
                setIsListening(field);
            } else {
                setIsListening(null)
            }
        }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({ variant: 'destructive', title: 'Image too large', description: 'Please upload an image smaller than 4MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => form.setValue('imageDataUri', e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    form.setValue('imageDataUri', undefined);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const onGenerate = async (values: VisualAidFormValues) => {
    startGeneration(async () => {
      setGeneratedVisual(null);
      setSuggestions([]);
      setSelectedSuggestions([]);
      const { visualAid, error } = await handleGenerateVisualAid(values);
      if (error || !visualAid) {
        toast({ variant: 'destructive', title: 'Generation Failed', description: error });
        return;
      }
      setGeneratedVisual(visualAid);
      setCurrentStep(3);

      const { suggestions, error: suggestionError } = await handleGetVisualAidSuggestions({
        topic: values.topic,
        visualType: values.visualType,
        imageDataUri: visualAid.imageDataUri,
      });
      if (suggestionError || !suggestions) {
        toast({ variant: 'destructive', title: 'Suggestion Failed', description: suggestionError });
        return;
      }
      setSuggestions(suggestions.suggestions);
    });
  };

  const onRefine = () => {
    startRefinement(async () => {
        if (!generatedVisual || !form.getValues()) {
            return;
        }

        const { visualAid, error } = await handleRefineVisualAid({
            originalPrompt: form.getValues(),
            originalImageDataUri: generatedVisual.imageDataUri,
            refinements: selectedSuggestions,
        });

        if (error || !visualAid) {
            toast({ variant: 'destructive', title: 'Refinement Failed', description: error });
            return;
        }

        setGeneratedVisual(visualAid);
        setSelectedSuggestions([]);
        toast({ title: 'Visual refined!' });

        const { suggestions, error: suggestionError } = await handleGetVisualAidSuggestions({
            topic: form.getValues().topic,
            visualType: form.getValues().visualType,
            imageDataUri: visualAid.imageDataUri,
        });

        if (suggestionError || !suggestions) {
            return;
        }
        setSuggestions(suggestions.suggestions);
    });
  };

  const toggleSuggestion = (suggestion: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestion) 
        ? prev.filter(s => s !== suggestion)
        : [...prev, suggestion]
    );
  };

  const handleDownload = () => {
    if (generatedVisual) {
      saveAs(generatedVisual.imageDataUri, `${form.getValues('topic').replace(/\s+/g, '_')}_visual.png`);
    }
  };

  const handleShare = async () => {
    if (navigator.share && generatedVisual) {
        try {
            const response = await fetch(generatedVisual.imageDataUri);
            const blob = await response.blob();
            const file = new File([blob], `${form.getValues('topic').replace(/\s+/g, '_')}_visual.png`, { type: blob.type });
            await navigator.share({
                title: `Visual Aid: ${form.getValues('topic')}`,
                text: `Check out this visual aid for "${form.getValues('topic')}"!`,
                files: [file],
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error sharing content' });
        }
    } else {
        toast({ variant: 'destructive', title: 'Share API not supported on this browser' });
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="w-full">
            <div className="relative mb-8 h-64 w-full rounded-lg bg-cover bg-center" style={{backgroundImage: `url(${heroImage || ''})`}}>
              {isHeroImageLoading && <Skeleton className="absolute inset-0" />}
              <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center text-center text-white p-4">
                <h1 className="text-4xl font-bold">Create a New Visual Aid</h1>
                <p className="mt-2 max-w-2xl">
                  Generate high-quality diagrams, infographics, charts, and presentations from your educational content using the power of AI.
                </p>
                <Button size="lg" onClick={() => setCurrentStep(2)} className="mt-6">
                  Get Started
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4">Recent Creations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-0">
                    <Image src="https://oaidalleapiprodscus.blob.core.windows.net/private/org-32mUM3w40ro5T52y5bFBF1rJ/user-wWkS6R6n9a3RKL1xnbg9xIwe/img-9K3p7lIq08qWwY5b4K2o7Z8f.png?st=2024-08-01T00%3A18%3A12Z&se=2024-08-01T02%3A18%3A12Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-07-31T20%3A58%3A58Z&ske=2024-08-01T20%3A58%3A58Z&sks=b&skv=2023-11-03&sig=j8N2mH/J5Z6R7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w" alt="The Water Cycle" width={600} height={400} className="rounded-t-lg" data-ai-hint="science diagram" />
                  </CardContent>
                  <CardFooter className="p-4">
                    <p className="font-medium">The Water Cycle</p>
                  </CardFooter>
                </Card>
                <Card>
                  <CardContent className="p-0">
                    <Image src="https://oaidalleapiprodscus.blob.core.windows.net/private/org-32mUM3w40ro5T52y5bFBF1rJ/user-wWkS6R6n9a3RKL1xnbg9xIwe/img-8J2o6kHq97pXvX4a3J1n6Y7e.png?st=2024-08-01T00%3A18%3A36Z&se=2024-08-01T02%3A18%3A36Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-07-31T20%3A58%3A58Z&ske=2024-08-01T20%3A58%3A58Z&sks=b&skv=2023-11-03&sig=g1F2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y0z" alt="Ancient Rome Timeline" width={600} height={400} className="rounded-t-lg" data-ai-hint="history infographic" />
                  </CardContent>
                  <CardFooter className="p-4">
                    <p className="font-medium">Ancient Rome Timeline</p>
                  </CardFooter>
                </Card>
                <Card>
                  <CardContent className="p-0">
                    <Image src="https://oaidalleapiprodscus.blob.core.windows.net/private/org-32mUM3w40ro5T52y5bFBF1rJ/user-wWkS6R6n9a3RKL1xnbg9xIwe/img-7I1n5jGp86oWuW3z2H0m5X6d.png?st=2024-08-01T00%3A19%3A01Z&se=2024-08-01T02%3A19%3A01Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-07-31T20%3A58%3A58Z&ske=2024-08-01T20%3A58%3A58Z&sks=b&skv=2023-11-03&sig=f0E1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y" alt="Photosynthesis Diagram" width={600} height={400} className="rounded-t-lg" data-ai-hint="math chart" />
                  </CardContent>
                  <CardFooter className="p-4">
                    <p className="font-medium">Photosynthesis Diagram</p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onGenerate)} className="flex flex-col gap-8">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> Content & Context</CardTitle>
                </CardHeader>
                <CardContent className="w-full space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Textarea {...field} rows={3} placeholder="e.g., The water cycle" />
                            <Button type="button" size="icon" variant={isListening === 'topic' ? 'destructive' : 'outline'} onClick={() => toggleListen('topic')} className="absolute bottom-2 right-2 h-8 w-8">
                                <Mic className="h-4 w-4" />
                            </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Context (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Textarea {...field} rows={5} placeholder="Paste textbook snippets, curriculum notes, or other relevant text here to improve the AI's understanding." />
                            <div className="absolute bottom-2 right-2 flex items-center gap-2">
                              <Input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  accept="image/*"
                              />
                              <Button type="button" size="icon" variant='outline' onClick={() => fileInputRef.current?.click()} className="h-8 w-8">
                                  <Upload className="h-4 w-4" />
                              </Button>
                              <Button type="button" size="icon" variant={isListening === 'context' ? 'destructive' : 'outline'} onClick={() => toggleListen('context')} className="h-8 w-8">
                                  <Mic className="h-4 w-4" />
                              </Button>
                            </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {form.watch('imageDataUri') && (
                    <div className="relative w-32 h-32 mt-2">
                        <Image src={form.getValues('imageDataUri')!} alt="Reference" layout="fill" objectFit="cover" className="rounded-md" />
                        <Button type="button" size="icon" variant="destructive" onClick={removeImage} className="absolute -top-2 -right-2 h-6 w-6 rounded-full">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                </CardContent>
            </Card>

            <div className="w-full space-y-8">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Palette /> Format & Style</CardTitle>
                    </CardHeader>
                    <CardContent className="w-full space-y-6">
                    <FormField
                    control={form.control}
                    name="visualType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Visual Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{visualTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Style Preference</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings /> Advanced Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="w-full space-y-6">
                    <FormField control={form.control} name="language" render={({ field }) => ( <FormItem><FormLabel>Language</FormLabel><FormControl><Input {...field} placeholder="e.g., English" /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="gradeLevel" render={({ field }) => ( <FormItem><FormLabel>Grade Level</FormLabel><FormControl><Input {...field} placeholder="e.g., 5th Grade" /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="curriculum" render={({ field }) => ( <FormItem><FormLabel>Curriculum (Optional)</FormLabel><FormControl><Input {...field} placeholder="e.g., CBSE, ICSE" /></FormControl><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="w-full">Back</Button>
                  <Button type="submit" size="lg" disabled={isGenerating} className="w-full">
                      {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Visual Aid</>}
                  </Button>
                </div>
            </div>
          </form>
          </Form>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Generated Visual</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-[500px] bg-muted/30 rounded-lg">
                  {isGenerating || isRefining ? (
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  ) : generatedVisual ? (
                    <Image src={generatedVisual.imageDataUri} alt={generatedVisual.altText} width={800} height={600} className="max-w-full max-h-[600px] object-contain rounded-md" />
                  ) : (
                    <p className="text-muted-foreground">Your visual will appear here.</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    {generatedVisual && (
                        <>
                        <Button onClick={handleDownload}><Download className="mr-2"/>Download</Button>
                        <Button variant="outline" onClick={handleShare}><Share2 className="mr-2"/>Share</Button>
                        </>
                    )}
                </CardFooter>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lightbulb /> AI Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
                  ) : suggestions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s, i) => (
                            <Badge 
                                key={i}
                                variant={selectedSuggestions.includes(s) ? "default" : "secondary"}
                                onClick={() => toggleSuggestion(s)}
                                className="cursor-pointer transition-colors"
                            >
                                {s}
                            </Badge>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No suggestions available.</p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button onClick={onRefine} disabled={isRefining || selectedSuggestions.length === 0} className="w-full">
                    {isRefining ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refining...</> : <><Sparkles className="mr-2"/>Refine with AI</>}
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep(2)} className="w-full">Back to Configuration</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="p-4 md:p-6">{renderStep()}</div>;
}
