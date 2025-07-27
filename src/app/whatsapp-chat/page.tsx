
'use client';

import { MainLayout } from '@/components/app/main-layout';
import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppChatPage() {
  return (
    <MainLayout activePage="whatsapp-chat">
        <div className="flex flex-col items-center justify-center text-center p-8 bg-background rounded-lg shadow-sm border h-[calc(100vh-12rem)]">
            <FaWhatsapp className="text-green-500 text-8xl mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Redirecting to WhatsApp...</h1>
            <p className="text-muted-foreground max-w-md">
                A new tab has been opened for your WhatsApp chat. If it didn't open automatically, please ensure pop-ups are allowed for this site.
            </p>
        </div>
    </MainLayout>
  );
}
