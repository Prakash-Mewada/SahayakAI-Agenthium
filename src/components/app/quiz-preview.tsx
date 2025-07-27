
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Share2, Copy, Eye } from 'lucide-react';
import type { GenerateWorksheetOutput } from '@/ai/flows/generate-worksheet';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface QuizPreviewProps {
  quizData: GenerateWorksheetOutput | null;
  onBack: () => void;
}

export function QuizPreview({ quizData, onBack }: QuizPreviewProps) {
  const { toast } = useToast();
  const [quizLink] = useState(`quiz.yourapp.com/join/${uuidv4().substring(0, 6)}`);

  if (!quizData) {
    return (
      <div className="text-center">
        <p>No quiz data available. Please generate a quiz first.</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${type} copied to clipboard!` });
  };

  const renderQuestion = (question: any, index: number) => {
    switch (question.type) {
        case 'multiple-choice':
            return (
                <div key={index} className="p-4 border-b">
                    <p className="font-semibold">{index + 1}. {question.question}</p>
                    <div className="mt-2 space-y-1">
                        {question.options.map((option: string, i: number) => (
                            <div key={i} className={`p-2 rounded-md ${option === question.answer ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                                {option}
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'fill-in-the-blanks':
             return (
                <div key={index} className="p-4 border-b">
                    <p className="font-semibold">{index + 1}. {question.question.replace('___', '__________')}</p>
                    <p className="mt-2 p-2 rounded-md bg-green-100 border border-green-300 font-medium">{question.answer}</p>
                </div>
            );
        case 'short-answer':
            return (
                <div key={index} className="p-4 border-b">
                    <p className="font-semibold">{index + 1}. {question.question}</p>
                     <p className="mt-2 p-2 rounded-md bg-green-100 border border-green-300">{question.answer}</p>
                </div>
            );
        default:
            return null;
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{quizData.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
                {quizData.questions.map((q, i) => renderQuestion(q, i))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Quiz Details</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>Questions: {quizData.questions.length}</Badge>
            {/* These would come from the configuration step */}
            <Badge variant="secondary">7th Grade</Badge> 
            <Badge variant="secondary">Science</Badge>
            <Badge variant="secondary">Medium</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Share & Play</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Share this link with your students to start the quiz.</p>
            <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
              <span className="text-sm font-mono truncate">{quizLink}</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopy(quizLink, 'Link')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-2">
                <Button><Eye className="mr-2" /> Preview as Student</Button>
                <Button variant="secondary" onClick={() => handleCopy(quizLink, 'Link')}>
                  <Share2 className="mr-2" /> Share Link
                </Button>
            </div>
          </CardContent>
        </Card>
        <Button variant="outline" onClick={onBack} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Configuration
        </Button>
      </div>
    </div>
  );
}
