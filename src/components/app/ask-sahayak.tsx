
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, RefreshCw, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateResponse, handleSimplifyResponse } from '@/app/actions';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export function AskSahayak() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: uuidv4(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = [...messages, userMessage];

    const { answer, error } = await handleGenerateResponse({ history });

    if (error || !answer) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error || 'Failed to get a response.',
      });
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } else {
      const aiMessage: Message = { id: uuidv4(), role: 'model', content: answer };
      setMessages((prev) => [...prev, aiMessage]);
    }
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const WelcomeMessage = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="p-4 bg-primary/10 rounded-full animate-pulse">
            <Bot className="h-16 w-16 text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold">Welcome to Ask Sahayak</h2>
        <p className="mt-2 text-muted-foreground">Your personal AI assistant for educational queries.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-background rounded-lg border shadow-sm">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
            <Avatar>
                <AvatarFallback>S</AvatarFallback>
                <AvatarImage src="https://placehold.co/100x100/947AD4/E6E9F2.png" data-ai-hint="chatbot avatar" />
            </Avatar>
            <h2 className="text-lg font-semibold">Ask Sahayak</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={clearChat} disabled={messages.length === 0}>
            <RefreshCw className="h-4 w-4"/>
            <span className="sr-only">Clear Chat</span>
        </Button>
      </header>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? <WelcomeMessage /> : (
            <div className="space-y-4">
            {messages.map((message, index) => (
                <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'model' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>S</AvatarFallback>
                            <AvatarImage src="https://placehold.co/100x100/947AD4/E6E9F2.png" data-ai-hint="chatbot avatar" />
                        </Avatar>
                    )}
                    <div className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p>{message.content}</p>
                    </div>
                     {message.role === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>Y</AvatarFallback>
                            <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="user avatar"/>
                        </Avatar>
                    )}
                </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>S</AvatarFallback>
                        <AvatarImage src="https://placehold.co/100x100/947AD4/E6E9F2.png" data-ai-hint="chatbot avatar" />
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-muted">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
            )}
            </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
