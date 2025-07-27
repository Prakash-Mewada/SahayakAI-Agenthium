
import { MainLayout } from '@/components/app/main-layout';
import { WorksheetGenerator } from '@/components/app/worksheet-generator';

export default function WorksheetPage() {
  return (
    <MainLayout activePage="worksheet">
        <WorksheetGenerator />
    </MainLayout>
  );
}
