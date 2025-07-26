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
} from '@/components/ui/sidebar';
import { GraduationCap, BotMessageSquare, Library, ClipboardList } from 'lucide-react';
import { ContentGenerator } from '@/components/app/content-generator';

export default function Home() {
  return (
      <SidebarProvider>
          <Sidebar>
              <SidebarHeader>
                  <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          <GraduationCap className="h-5 w-5" />
                      </div>
                      <span className="text-lg font-semibold">EduGenius</span>
                  </div>
              </SidebarHeader>
              <SidebarContent>
                  <SidebarMenu>
                      <SidebarMenuItem>
                          <SidebarMenuButton href="/" isActive>
                              <BotMessageSquare />
                              Create Content
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                          <SidebarMenuButton href="/worksheet">
                              <ClipboardList />
                              Worksheet Generator
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                          <SidebarMenuButton href="/library">
                              <Library />
                              Content Library
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                  </SidebarMenu>
              </SidebarContent>
          </Sidebar>
          <SidebarInset>
              <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:h-16 md:px-6">
                  <div className="flex items-center gap-2">
                      <SidebarTrigger className="md:hidden" />
                      <h1 className="text-lg font-semibold md:text-xl">
                          AI Content Creation
                      </h1>
                  </div>
              </header>
              <main className="flex-1 p-4 md:p-6">
                  <ContentGenerator />
              </main>
          </SidebarInset>
      </SidebarProvider>
  );
}
