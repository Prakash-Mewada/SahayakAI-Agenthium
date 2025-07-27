'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from './use-toast';

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

export function useSpeechToText() {
    const { toast } = useToast();
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setTranscript(finalTranscript + interimTranscript);
            };

            recognition.onerror = (event) => {
                toast({ variant: 'destructive', title: 'Speech Recognition Error', description: event.error });
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };
            
            recognitionRef.current = recognition;
        } else {
            toast({ variant: 'destructive', title: 'Unsupported Browser', description: 'Speech recognition is not supported in this browser.' });
        }

        return () => {
            recognitionRef.current?.stop();
        };
    }, [toast]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const resetTranscript = () => {
        setTranscript('');
    }

    return {
        transcript,
        isListening,
        startListening,
        stopListening,
        resetTranscript,
    };
}
