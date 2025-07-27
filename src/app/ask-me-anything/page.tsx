
import { MainLayout } from '@/components/app/main-layout';
import { AskMeAnything } from '@/components/app/ask-me-anything';

export default function AskMeAnythingPage() {
  return (
    <MainLayout activePage="ask-me-anything">
      <AskMeAnything />
    </MainLayout>
  );
}
