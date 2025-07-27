
import { MainLayout } from '@/components/app/main-layout';
import { QuizGenerator } from '@/components/app/quiz-generator';

export default function QuizPage() {
  return (
    <MainLayout activePage="quiz">
        <QuizGenerator />
    </MainLayout>
  );
}
