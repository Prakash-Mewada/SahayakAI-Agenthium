
import { MainLayout } from '@/components/app/main-layout';
import { VisualAidCreator } from '@/components/app/visual-aid-creator';

export default function VisualAidPage() {
  return (
    <MainLayout activePage="visual-aid">
      <VisualAidCreator />
    </MainLayout>
  );
}
