
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface QuizDashboardProps {
  onGetStarted: () => void;
}

const recentQuizzes = [
  { id: 1, name: 'Photosynthesis Basics', topic: 'Science', grade: '7th Grade', date: '2024-07-30' },
  { id: 2, name: 'Algebra Fundamentals', topic: 'Math', grade: '9th Grade', date: '2024-07-28' },
  { id: 3, name: 'Indian Independence', topic: 'History', grade: '8th Grade', date: '2024-07-25' },
];

export function QuizDashboard({ onGetStarted }: QuizDashboardProps) {
  const heroImage = "/images/quiztopsection.png";

  return (
    <div className="space-y-12">
      <Card className="shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-gray-800">Create a New Quiz</h1>
            <p className="mt-4 text-lg text-gray-600">
              Start by inputting your topic or an image, set the details, and generate your quiz instantly.
            </p>
            <Button onClick={onGetStarted} className="mt-8 w-full md:w-auto" size="lg">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <div className="hidden md:flex items-center justify-center p-8 bg-gray-50">
            <Image
                src={heroImage}
                alt="Quiz illustration"
                width={600}
                height={400}
                className="rounded-lg object-cover"
                data-ai-hint="quiz illustration"
            />
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-3xl font-bold mb-6">Your Recent Quizzes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentQuizzes.map(quiz => (
            <Card key={quiz.id} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{quiz.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{quiz.topic}</Badge>
                  <Badge variant="outline">{quiz.grade}</Badge>
                  <Badge variant="outline">{new Date(quiz.date).toLocaleDateString()}</Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="secondary" size="sm">Edit</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
