
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  GraduationCap,
  BotMessageSquare,
  Library,
  ClipboardList,
  Image,
  ClipboardCheck,
  HelpCircle,
  Search,
  Bell,
  MessageCircle,
} from 'lucide-react';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

type PageSlug =
  | 'create-content'
  | 'worksheet'
  | 'quiz'
  | 'visual-aid'
  | 'library'
  | 'ask-sahayak'
  | 'whatsapp-chat';

const navItems: {
  slug: PageSlug;
  href: string;
  icon: React.ReactNode;
  label: string;
  isExternal?: boolean;
}[] = [
  { slug: 'create-content', href: '/', icon: <BotMessageSquare />, label: 'Create Content' },
  { slug: 'worksheet', href: '/worksheet', icon: <ClipboardList />, label: 'Worksheet Generator' },
  { slug: 'quiz', href: '/quiz', icon: <ClipboardCheck />, label: 'Quiz Generator' },
  { slug: 'visual-aid', href: '/visual-aid', icon: <Image />, label: 'Visual Aid Creator' },
  { slug: 'ask-sahayak', href: '/ask-sahayak', icon: <HelpCircle />, label: 'Ask Sahayak' },
  { slug: 'whatsapp-chat', href: 'https://platform-flow-5163--dev.sandbox.my.salesforce-sites.com/', icon: <MessageCircle />, label: 'WhatsApp Chat', isExternal: true },
];

const libraryItem = { slug: 'library' as PageSlug, href: '/library', icon: <Library />, label: 'Content Library' };

export function MainLayout({
  children,
  activePage,
}: {
  children: React.ReactNode;
  activePage: PageSlug;
}) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);

  React.useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const handleNavigation = (href: string) => {
    if (pathname !== href) {
        setIsNavigating(true);
    }
  };

  useEffect(() => {
    // Function to check connectivity status
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (!navigator.onLine && window.location.pathname !== '/library') {
        window.location.href = '/library';
      }
    };

    // Initial check
    checkOnlineStatus();

    // Set interval to check every 5 seconds (5000 ms)
    const intervalId = setInterval(checkOnlineStatus, 5000);

    return () => {
      clearInterval(intervalId); // Cleanup on unmount
    };
  }, []);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="justify-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">Sahayak</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="mt-8">
          <SidebarMenu className="space-y-2 p-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.slug}>
                <SidebarMenuButton
                    onClick={() => !item.isExternal && handleNavigation(item.href)}
                    isActive={activePage === item.slug}
                    className="p-4"
                    href={item.href}
                    target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                >
                    {item.icon}
                    {item.label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="mt-auto p-2 mb-4">
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => handleNavigation(libraryItem.href)}
                        isActive={activePage === libraryItem.slug}
                        className="p-4"
                        href={libraryItem.href}
                    >
                        {libraryItem.icon}
                        {libraryItem.label}
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
        </SidebarFooter>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center">
              <span className="relative flex size-3 mr-2">
                <span className={`absolute inline-flex h-full w-full opacity-75 rounded-full ${isOnline ? 'bg-green-400 animate-ping' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex size-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-sm text-gray-600">
                {isOnline ? 'Online & Synced' : 'Offline Mode'}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-400 text-center">
            Made with <Link
                  href="/our-team"
                  className="cursor-pointer"
                ><span className="text-violet-500 hover:underline">Agenthium</span></Link>
          </div>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-end border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 md:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
            </div>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search..." className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] rounded-full bg-muted" />
                </div>
                <div className="relative">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 inline-flex h-2 w-2 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white"></span>
                    </Button>
                </div>
                <Avatar className="h-9 w-9">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="@shadcn" data-ai-hint="indian teacher" />
                    <AvatarFallback>S</AvatarFallback>
                </Avatar>
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
            {isNavigating ? (
                <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            ) : (
                children
            )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
