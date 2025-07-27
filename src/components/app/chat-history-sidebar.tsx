'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Trash2, Edit } from 'lucide-react';
import type { Chat } from '@/types';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

interface ChatHistorySidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  setActiveChatId: (id: string) => void;
  createNewChat: () => void;
  deleteChat: (id: string) => void;
}

export function ChatHistorySidebar({
  chats,
  activeChatId,
  setActiveChatId,
  createNewChat,
  deleteChat,
}: ChatHistorySidebarProps) {

  const timeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };
    
  return (
    <div className="md:col-span-1 h-full border-r">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <Button onClick={createNewChat} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {chats.map(chat => (
              <div key={chat.id} className={cn(
                  "group p-2 rounded-md cursor-pointer flex justify-between items-center",
                  activeChatId === chat.id ? 'bg-primary/10' : 'hover:bg-muted/50'
              )}>
                <button
                  onClick={() => setActiveChatId(chat.id)}
                  className="flex-1 text-left"
                >
                  <p className="font-semibold text-sm truncate">{chat.title}</p>
                  <p className="text-xs text-muted-foreground">{timeSince(chat.createdAt)}</p>
                </button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this conversation.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteChat(chat.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
