'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Message } from '@/types';
import { Bot, User, ThumbsUp, ThumbsDown, RefreshCw, Volume2, Loader2 } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onAdjust: (answer: string, action: 'expand' | 'simplify') => void;
  isAdjusting: boolean;
  onPlayback: (id: string, text: string) => void;
  isSpeaking: boolean;
}

export default function ChatMessage({ message, onAdjust, isAdjusting, onPlayback, isSpeaking }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className="flex items-start gap-4 p-4">
      <Avatar className="h-8 w-8 border">
        <AvatarFallback>{isAssistant ? <Bot size={18} /> : <User size={18} />}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <p className="font-semibold">{isAssistant ? 'EduGenius AI' : 'You'}</p>
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html: message.content.replace(/\n/g, '<br/>') }} />
        {isAssistant && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPlayback(message.id, message.content)}>
                    <Volume2 className={`h-4 w-4 ${isSpeaking ? 'text-primary' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isSpeaking ? 'Stop' : 'Read aloud'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAdjust(message.content, 'expand')} disabled={isAdjusting}>
                    {isAdjusting ? <Loader2 className="h-4 w-4 animate-spin"/> : <ThumbsUp className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Expand Answer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAdjust(message.content, 'simplify')} disabled={isAdjusting}>
                        {isAdjusting ? <Loader2 className="h-4 w-4 animate-spin"/> : <ThumbsDown className="h-4 w-4" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Simplify Answer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}
