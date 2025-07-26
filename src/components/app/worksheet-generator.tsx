'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  handleGenerateWorksheet,
  handleGetSuggestions,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { GenerateWorksheetOutput } from '@/ai/flows/generate-worksheet';
import { Loader2, Mic, Save, Paperclip, X, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"

const worksheetSchema = z.object({
  topic: z.string().min(1, 'Please enter a topic.'),
  language: z.string(),
  worksheetType: z.string(),
  questionCount: z.number().min(1).max(20),
  difficulty: z.string(),
  curriculum: z.string().optional(),
  imageDataUri: z.string().optional(),
});

type WorksheetFormValues = z.infer<typeof worksheetSchema>;

const languages = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Kannada', label: 'Kannada' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
];

const worksheetTypes = [
  'Multiple Choice',
  'Fill in the Blanks',
  'Short Answer',
  'Matching',
  'True/False',
];

const difficulties = ['Easy', 'Medium', 'Hard'];

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

export function WorksheetGenerator() {
  const { toast } = useToast();
  const [isGenerating, startGeneration] = useTransition();
  const [worksheet, setWorksheet] = useState<GenerateWorksheetOutput | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const form = useForm<WorksheetFormValues>({
    resolver: zodResolver(worksheetSchema),
    defaultValues: {
      topic: '',
      language: 'English',
      worksheetType: 'Multiple Choice',
      questionCount: 5,
      difficulty: 'Medium',
      curriculum: '',
      imageDataUri: '',
    },
  });

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let transcript = '';
        for (const result of event.results) {
          transcript += result[0].transcript;
        }
        form.setValue('topic', transcript);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please upload an image smaller than 4MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        form.setValue('imageDataUri', dataUri);
        setAttachedImage(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    form.setValue('imageDataUri', undefined);
    setAttachedImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const toggleListen = () => {
    if (!recognitionRef.current) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: 'Speech recognition is not supported in this browser.',
      });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      const selectedLang =
        languages.find((l) => l.value === form.getValues('language'))?.value ||
        'en-US';
      recognitionRef.current.lang = selectedLang;
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  const handleSuggestion = async () => {
    const topic = form.getValues('topic');
    if (topic.length > 10) {
      const { suggestions, error } = await handleGetSuggestions({
        worksheetIdea: topic,
      });
      if (error) {
        toast({ variant: 'destructive', title: 'Suggestion Error' });
        return;
      }
      setSuggestions(suggestions);
    }
  };

  const onSubmit = (values: WorksheetFormValues) => {
    startGeneration(async () => {
      setWorksheet(null);
      const { worksheet, error } = await handleGenerateWorksheet(values);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: error,
        });
        return;
      }
      setWorksheet(worksheet ?? null);
    });
  };

  const renderQuestion = (question: any, index: number) => {
    const questionContent = () => {
        switch (question.type) {
            case 'multiple-choice':
                return (
                    <>
                        <p><strong>{index + 1}. {question.question}</strong></p>
                        <ul className="list-disc pl-5 mt-2">
                            {question.options.map((option: string, i: number) => (
                                <li key={i}>{option}</li>
                            ))}
                        </ul>
                    </>
                );
            case 'fill-in-the-blanks':
                return <p><strong>{index + 1}. {question.question.replace('___', '__________')}</strong></p>;
            case 'short-answer':
                return <p><strong>{index + 1}. {question.question}</strong></p>;
            default:
                return null;
        }
    }

    return (
        <Accordion type="single" collapsible className="w-full mb-2" key={index}>
            <AccordionItem value={`item-${index}`} className="border rounded-md px-4">
                <AccordionTrigger>
                    <div className="flex-1 text-left">
                        {questionContent()}
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <Badge variant="secondary">Answer</Badge>
                    <p className="p-2 bg-muted/50 rounded-md mt-1">{question.answer}</p>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Worksheet Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic / Content</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            {...field}
                            rows={5}
                            placeholder="e.g., The basics of photosynthesis for 5th graders"
                            onBlur={handleSuggestion}
                          />
                           <div className="absolute bottom-2 right-2 flex items-center gap-2">
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-8 w-8"
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant={isListening ? 'destructive' : 'outline'}
                                onClick={toggleListen}
                                className="h-8 w-8"
                            >
                                <Mic className="h-4 w-4" />
                            </Button>
                           </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {attachedImage && (
                    <div className="relative w-32 h-32">
                        <img src={attachedImage} alt="Uploaded image" className="rounded-md w-full h-full object-cover"/>
                        <Button type="button" size="icon" variant="destructive" onClick={removeImage} className="absolute -top-2 -right-2 h-6 w-6 rounded-full">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                      <Button
                        key={i}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => form.setValue('topic', s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
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
                  name="worksheetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Worksheet Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {worksheetTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="questionCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          {...field}
                          onChange={(event) =>
                            field.onChange(+event.target.value)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {difficulties.map((diff) => (
                            <SelectItem key={diff} value={diff}>
                              {diff}
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
                  name="curriculum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Curriculum (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., CBSE, ICSE" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Generate Worksheet'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Generated Worksheet</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] p-4 border rounded-md">
              {isGenerating ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : worksheet ? (
                <div>
                  <h2 className="text-xl font-bold mb-4">{worksheet.title}</h2>
                  <div>
                    {worksheet.questions.map((q, i) => renderQuestion(q, i))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Your worksheet will be generated here.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          {worksheet && !isGenerating && (
            <CardFooter className="flex justify-end">
              <Button>
                <Save className="mr-2 h-4 w-4" /> Save Offline
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

    