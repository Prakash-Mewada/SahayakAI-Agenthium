
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
  const heroImage = "data:image/webp;base64,UklGRsoKAABXRUJQVlA4WAoAAAAgAAAA/wAAvgAAVlA4ILoJAAAwNgCdASoAAMAA+EUit1EnIqGgpxgJgB5pJaQAy34c0Gz7B/7v/9/lH4b/pPqA/zj+d/bL5gf6J/ifYA/lP8i9QD/L/3r3Af53+8/4r9/P+B/dv+r/yP/b8AH8s/t3/V/u3/I/3H7gP9R/j/9n+8n+9/1H9n/AD/S/3r/qf4b/df+5/if/N/eP+n/yP/x/cv9N61ftV/r/8H9yP7x6s/mf/r/4v8Z/uX5K/z3/E/2X+F/5b/qP7f/bf6nf7n/u/gJ/o//1/9v4Ef4v/Pf6b/Uf5v/tf+P/ef+x/d/7n////9+AH+Vf5n/yf+T/hv/N/df+z/mP/////9gB/6T/K/7T/J//X/mP+j////+6nf//+hH7//6X/////+6nf//+n/////+8H+if6v+8/8r+zf53////+6m///+wH+/f6n+8/+f/hv+L/////+9X///5gH7x/tv/r/4X/9f8X/////+wR/iP8j/ff+P/8/8t/////+sl///9gP7v/tv/j/3//9/lP///+wR/ev+B/uP/L/8/+c/////+u////5g";

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
