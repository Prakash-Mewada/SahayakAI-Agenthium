
'use client';

import { useState } from 'react';
import { QuizDashboard } from './quiz-dashboard';
import { QuizConfiguration } from './quiz-configuration';
import { QuizPreview } from './quiz-preview';
import type { GenerateWorksheetOutput } from '@/ai/flows/generate-worksheet';


export function QuizGenerator() {
  const [step, setStep] = useState(1);
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateWorksheetOutput | null>(null);

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePreviousStep = () => setStep(prev => prev - 1);

  const handleQuizGenerated = (quiz: GenerateWorksheetOutput) => {
    setGeneratedQuiz(quiz);
    handleNextStep();
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <QuizDashboard onGetStarted={handleNextStep} />;
      case 2:
        return <QuizConfiguration onQuizGenerated={handleQuizGenerated} onBack={handlePreviousStep} />;
      case 3:
        return <QuizPreview quizData={generatedQuiz} onBack={handlePreviousStep} />;
      default:
        return <QuizDashboard onGetStarted={handleNextStep} />;
    }
  };

  return (
    <div className="w-full">
      {renderStep()}
    </div>
  );
}
