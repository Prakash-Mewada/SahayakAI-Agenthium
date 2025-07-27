'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useChat } from 'ai/react';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Mic, X, ThumbsUp, ThumbsDown, RefreshCw, Download, Volume2, Bot, User } from 'lucide-react';
import { ChatHistorySidebar } from './chat-history-sidebar';
import { useToast } from '@/hooks/use-toast';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import type { Chat, Message } from '@/types';
import { handleAdjustAnswer, getResponse } from '@/app/actions';
import ChatMessage from './chat-message';

const initialChats: Chat[] = [
  {
    id: 'dummy-1',
    title: 'What is photosynthesis?',
    messages: [
      { id: 'msg-1', role: 'user', content: 'What is photosynthesis?' },
      { id: 'msg-2', role: 'assistant', content: 'Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy.' },
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'dummy-2',
    title: 'Explain the theory of relativity',
    messages: [
      { id: 'msg-3', role: 'user', content: 'Explain the theory of relativity' },
      { id: 'msg-4', role: 'assistant', content: 'The theory of relativity, developed by Albert Einstein, is a cornerstone of modern physics. It has two main parts: special relativity and general relativity.' },
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
];


export function AskMeAnything() {
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const { transcript, isListening, startListening, stopListening, resetTranscript } = useSpeechToText();
  const { currentlyPlaying, play, stop } = useTextToSpeech();
  const [isAdjusting, startTransition] = useTransition();

  const { messages, setMessages, input, setInput, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onError: (error) => toast({ variant: 'destructive', title: 'Error', description: error.message }),
  });
  
  const activeChat = chats.find(chat => chat.id === activeChatId);
  const chatContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    try {
        const savedChats = localStorage.getItem('amaChats');
        const parsedChats = savedChats ? (JSON.parse(savedChats) as Chat[]).map(c => ({...c, createdAt: new Date(c.createdAt)})) : [];
        const allChats = [...initialChats, ...parsedChats.filter(pc => !initialChats.some(ic => ic.id === pc.id))];
        setChats(allChats);
    } catch(e) {
        setChats(initialChats);
    }
  }, []);

  useEffect(() => {
    if (activeChat) {
      setMessages(activeChat.messages);
    } else {
      setMessages([]);
    }
  }, [activeChatId, setMessages]);


  useEffect(() => {
    setInput(transcript);
  }, [transcript, setInput]);

  useEffect(() => {
    const nonDummyChats = chats.filter(c => !c.id.startsWith('dummy-'));
    if (nonDummyChats.length > 0) {
      localStorage.setItem('amaChats', JSON.stringify(nonDummyChats));
    }
  }, [chats]);
  
  const createNewChat = () => {
    const newChatId = uuidv4();
    const newChat: Chat = {
        id: newChatId,
        title: 'New Conversation',
        messages: [],
        createdAt: new Date(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChatId);
    setMessages([]);
    setInput('');
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMessage: Message = { id: uuidv4(), role: 'user', content: input };
    
    let currentChatId = activeChatId;
    if (!currentChatId) {
        currentChatId = uuidv4();
        const newChat: Chat = {
            id: currentChatId,
            title: input.substring(0, 40),
            messages: [newUserMessage],
            createdAt: new Date(),
        };
        setChats(prev => [newChat, ...prev]);
        setActiveChatId(currentChatId);
    } else {
        setChats(prev => prev.map(c => c.id === currentChatId ? {...c, messages: [...c.messages, newUserMessage]} : c));
    }
    
    handleSubmit(e, {
        options: {
            body: {
                messages: [...(activeChat?.messages ?? []), newUserMessage]
            }
        },
        // @ts-ignore
        onFinish: (message: Message) => {
            setChats(prev => prev.map(c => c.id === currentChatId ? {...c, messages: [...c.messages, message]} : c));
        }
    });
};

  const handleAdjust = async (answer: string, action: 'expand' | 'simplify') => {
    startTransition(async () => {
        const { adjustedAnswer, error } = await handleAdjustAnswer({ answer, action });
        if (error) {
            toast({ variant: 'destructive', title: 'Adjustment Failed', description: error });
            return;
        }
        if(adjustedAnswer && activeChatId) {
            const adjustedMessage: Message = { id: uuidv4(), role: 'assistant', content: adjustedAnswer, isAdjusted: true };
            setMessages(prev => [...prev, adjustedMessage]);
            setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, adjustedMessage] } : c));
        }
    });
  }

  const exportToPDF = () => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
        toast({ title: "Exporting to PDF..." });
        html2canvas(chatContainer, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const width = pdfWidth;
            const height = width / ratio;

            let position = 0;
            let remainingHeight = canvasHeight * (pdfWidth / canvasWidth);

            pdf.addImage(imgData, 'PNG', 0, position, width, height);
            remainingHeight -= pdfHeight;

            while (remainingHeight > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, width, height);
                remainingHeight -= pdfHeight;
            }
            pdf.save(`${activeChat?.title.replace(/\s/g, '_') ?? 'conversation'}.pdf`);
            toast({ title: "PDF exported successfully!" });
        });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-6rem)]">
        <ChatHistorySidebar
            chats={chats}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            createNewChat={createNewChat}
            deleteChat={(chatId) => {
                setChats(prev => prev.filter(c => c.id !== chatId));
                if (activeChatId === chatId) {
                    setActiveChatId(null);
                    setMessages([]);
                }
            }}
        />

        <div className="md:col-span-3 h-full flex flex-col">
            <Card className="flex-1 flex flex-col h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{activeChat?.title ?? 'Ask Me Anything'}</CardTitle>
                    {activeChat && <Button variant="outline" size="sm" onClick={exportToPDF}><Download className="mr-2 h-4 w-4" />Export to PDF</Button>}
                </CardHeader>
                <CardContent ref={chatContainerRef} className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        {messages.length > 0 ? (
                            messages.map(m => (
                                <ChatMessage
                                    key={m.id}
                                    message={m}
                                    onAdjust={handleAdjust}
                                    isAdjusting={isAdjusting}
                                    onPlayback={play}
                                    isSpeaking={currentlyPlaying === m.id}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <Bot size={48} className="mb-4" />
                                <h3 className="text-lg font-semibold">Start a conversation</h3>
                                <p className="text-sm">Ask me anything about educational topics, lesson planning, or classroom activities.</p>
                            </div>
                        )}
                        {isLoading && messages[messages.length -1].role === 'user' && (
                            <div className="flex items-start gap-4 p-4">
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback><Bot size={18}/></AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-2 pt-1">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    <span className="text-sm text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
                <CardFooter>
                    <form onSubmit={handleFormSubmit} className="w-full relative">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question here or use the microphone..."
                            className="pr-20 min-h-[60px]"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleFormSubmit(e as any);
                                }
                            }}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                           <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" size="icon" variant={isListening ? 'destructive' : 'outline'} onClick={isListening ? stopListening : startListening}>
                                        <Mic className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{isListening ? 'Stop Listening' : 'Start Listening'}</p>
                                </TooltipContent>
                            </Tooltip>
                            </TooltipProvider>
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Bot className="h-5 w-5" />}
                            </Button>
                        </div>
                    </form>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
