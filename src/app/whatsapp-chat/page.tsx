
'use client';

import { MainLayout } from '@/components/app/main-layout';
import { Button } from '@/components/ui/button';
import { FaWhatsapp } from 'react-icons/fa';
import { useEffect } from 'react';

export default function WhatsAppChatPage() {
    const whatsappUrl = 'https://platform-flow-5163--dev.sandbox.my.salesforce-sites.com/';

    useEffect(() => {
        window.open(whatsappUrl, '_blank');
    }, []);

    const openLink = () => {
        window.open(whatsappUrl, '_blank');
    };

  return (
    <MainLayout activePage="whatsapp-chat">
        <div className="flex flex-col items-center justify-center text-center p-8 bg-background rounded-lg shadow-sm border h-[calc(100vh-12rem)]">
            <FaWhatsapp className="text-green-500 text-8xl mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Redirecting to WhatsApp...</h1>
            <p className="text-muted-foreground max-w-md mb-8">
                A new tab has been opened for your WhatsApp chat. If it didn't open automatically, please ensure pop-ups are allowed for this site.
            </p>
            <Button onClick={openLink}>
                Open WhatsApp Chat
            </Button>
        </div>
    </MainLayout>
  );
}
