
'use client';

import { useState, useTransition, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  handleGenerateWorksheet,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, Upload, ArrowLeft } from 'lucide-react';
import type { GenerateWorksheetOutput } from '@/ai/flows/generate-worksheet';

interface QuizConfigurationProps {
  onQuizGenerated: (quiz: GenerateWorksheetOutput) => void;
  onBack: () => void;
}

const quizSchema = z.object({
  topic: z.string().min(1, 'Please enter a topic.'),
  language: z.string(),
  gradeLevel: z.string(),
  subject: z.string(),
  questionType: z.string(),
  questionCount: z.number().min(1).max(20),
  difficulty: z.string(),
  curriculum: z.string().optional(),
  imageDataUri: z.string().optional(),
});

type QuizFormValues = z.infer<typeof quizSchema>;

const languages = ['English', 'Hindi', 'Tamil', 'Spanish', 'French'];
const gradeLevels = ['5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'];
const questionTypes = ['MCQ', 'True/False', 'Fill in the Blanks', 'Short Answer'];
const difficulties = ['Easy', 'Medium', 'Hard'];
const curriculums = ['CBSE', 'ICSE', 'State Board'];

export function QuizConfiguration({ onQuizGenerated, onBack }: QuizConfigurationProps) {
  const { toast } = useToast();
  const [isGenerating, startGeneration] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      topic: '',
      language: 'English',
      gradeLevel: '7th Grade',
      subject: 'Science',
      questionType: 'MCQ',
      questionCount: 10,
      difficulty: 'Medium',
      curriculum: 'CBSE',
    },
  });
  
  const onSubmit = (values: QuizFormValues) => {
    startGeneration(async () => {
      // Map form values to the worksheet generation input
      const worksheetInput = {
        topic: `${values.subject}: ${values.topic} for ${values.gradeLevel}`,
        worksheetType: values.questionType,
        questionCount: values.questionCount,
        difficulty: values.difficulty,
        language: values.language,
        curriculum: values.curriculum,
        imageDataUri: values.imageDataUri,
      };

      const { worksheet, error } = await handleGenerateWorksheet(worksheetInput);
      if (error || !worksheet) {
        toast({
          variant: 'destructive',
          title: 'Quiz Generation Failed',
          description: error || 'An unknown error occurred.',
        });
        return;
      }
      onQuizGenerated(worksheet);
    });
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Configure Your Quiz</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Input Content</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button type="button" variant="outline"><Mic className="mr-2" /> Record Audio</Button>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2" /> Upload Image
                  <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                </Button>
              </div>
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic or Text</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Paste concepts, questions, or a topic..." rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Quiz Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField name="language" render={({ field }) => ( <FormItem><FormLabel>Language</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField name="gradeLevel" render={({ field }) => ( <FormItem><FormLabel>Grade Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{gradeLevels.map(gl => <SelectItem key={gl} value={gl}>{gl}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField name="subject" render={({ field }) => ( <FormItem><FormLabel>Subject</FormLabel><FormControl><Input {...field} placeholder="e.g., Biology" /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="questionType" render={({ field }) => ( <FormItem><FormLabel>Question Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{questionTypes.map(qt => <SelectItem key={qt} value={qt}>{qt}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField name="difficulty" render={({ field }) => ( <FormItem><FormLabel>Difficulty</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField name="curriculum" render={({ field }) => ( <FormItem><FormLabel>Curriculum</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{curriculums.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
              </div>
              <FormField
                control={form.control}
                name="questionCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1} max={20} step={1}
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Quiz...</> : 'Generate Quiz'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
