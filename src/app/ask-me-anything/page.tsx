
import { AskMeAnything } from '@/components/app/ask-me-anything';
import { MainLayout } from '@/components/app/main-layout';

export default function AskMeAnythingPage() {
  return (
    <MainLayout activePage="ask-me-anything">
      <AskMeAnything />
    </MainLayout>
  );
}
