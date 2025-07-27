
import { MainLayout } from '@/components/app/main-layout';
import { ContentLibrary } from '@/components/app/content-library';

export default function LibraryPage() {
  return (
    <MainLayout activePage="library">
      <ContentLibrary />
    </MainLayout>
  );
}
