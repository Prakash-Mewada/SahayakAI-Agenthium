
import { MainLayout } from '@/components/app/main-layout';
import { ContentGenerator } from '@/components/app/content-generator';

export default function Home() {
  return (
      <MainLayout activePage="create-content">
          <ContentGenerator />
      </MainLayout>
  );
}
