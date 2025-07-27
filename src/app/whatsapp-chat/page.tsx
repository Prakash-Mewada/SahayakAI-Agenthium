
import { MainLayout } from '@/components/app/main-layout';

export default function WhatsAppChatPage() {
  return (
    <MainLayout activePage="whatsapp-chat">
        <div className="text-center">
            <h1 className="text-2xl font-bold">WhatsApp Chat</h1>
            <p className="text-muted-foreground">Redirected to new tab!</p>
        </div>
    </MainLayout>
  );
}
