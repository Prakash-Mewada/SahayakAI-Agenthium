
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, Send, Upload, X, Bot, User, Play, Save, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import type { GenerateRagBasedResponseOutput, Message } from '@/ai/flows/generate-rag-response';

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}
declare global {
    interface Window {
        SpeechRecognition: { new (): SpeechRecognition };
        webkitSpeechRecognition: { new (): SpeechRecognition };
    }
}

async function handleGenerateResponse(messages: Message[], imageDataUri?: string): Promise<GenerateRagBasedResponseOutput> {
    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: messages, imageDataUri }),
    });
    if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody.error || 'An unknown error occurred');
    }
    return res.json();
}

export function AskMeAnything() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [imageDataUri, setImageDataUri] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { play, stop, currentlyPlaying } = useTextToSpeech();
  
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInput(prev => prev + transcript + ' ');
      };
      recognition.onerror = (event) => {
        toast({ variant: 'destructive', title: 'Speech Recognition Error', description: event.error });
        setIsListening(false);
      }
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [toast]);

  const toggleListen = () => {
    if (recognitionRef.current) {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsListening(!isListening);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({ variant: 'destructive', title: 'Image too large', description: 'Please upload an image smaller than 4MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setImageDataUri(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageDataUri(undefined);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !imageDataUri) return;

    const newUserMessage: Message = { role: 'user', content: [{ text: input, ...(imageDataUri && { media: { url: imageDataUri }}) }] };
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setInput('');
    setImageDataUri(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsLoading(true);
    try {
        const result = await handleGenerateResponse(currentMessages, imageDataUri);
        setMessages(prev => [...prev, { role: 'model', content: [{ text: result.answer }] }]);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        setMessages(prev => prev.slice(0, -1)); // Remove the user message if AI fails
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      <Card className="md:col-span-1 h-full flex flex-col">
        <CardHeader>
          <CardTitle>Past Conversations</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <div className="space-y-4">
                {/* Placeholder for chat history items */}
                <p className="text-sm text-muted-foreground">No past conversations yet.</p>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 h-full flex flex-col">
        <CardHeader>
          <CardTitle>Ask Me Anything</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback><Bot /></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {msg.content.map((part, i) => (
                                    <div key={i}>
                                        {part.media && <Image src={part.media.url} alt="User upload" width={200} height={200} className="rounded-md mb-2" />}
                                        <p>{part.text}</p>
                                    </div>
                                ))}
                                <div className="flex gap-2 mt-2">
                                  <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => play(index.toString(), msg.content[0].text || '')}>
                                      <Play className={`w-4 h-4 ${currentlyPlaying === index.toString() ? 'text-green-500' : ''}`} />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="w-6 h-6">
                                      <Save className="w-4 h-4" />
                                  </Button>
                                </div>
                            </div>
                             {msg.role === 'user' && (
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                                <AvatarFallback><Bot /></AvatarFallback>
                            </Avatar>
                            <div className="p-3 rounded-lg bg-muted">
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </CardContent>
        <CardFooter>
            <form onSubmit={handleSubmit} className="w-full space-y-2">
                {imageDataUri && (
                    <div className="relative w-24 h-24">
                        <Image src={imageDataUri} alt="Preview" layout="fill" objectFit="cover" className="rounded-md" />
                        <Button type="button" size="icon" variant="destructive" onClick={removeImage} className="absolute -top-2 -right-2 h-6 w-6 rounded-full">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <div className="relative">
                    <Textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question or use voice input..." 
                        className="pr-24"
                        rows={2}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                        <Button type="button" size="icon" variant={isListening ? 'destructive' : 'outline'} onClick={toggleListen}>
                            <Mic className="h-5 w-5" />
                        </Button>
                         <Button type="button" size="icon" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-5 w-5" />
                            <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </Button>
                        <Button type="submit" size="icon" disabled={isLoading || (!input.trim() && !imageDataUri)}>
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </form>
        </CardFooter>
      </Card>
    </div>
  );
}
