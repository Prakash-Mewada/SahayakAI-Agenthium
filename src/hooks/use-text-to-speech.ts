'use client';

import { useState, useEffect, useCallback } from 'react';

export function useTextToSpeech() {
    const [isSupported, setIsSupported] = useState(false);
    const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

    useEffect(() => {
        setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
        // Cancel speech on component unmount or page navigation
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const play = useCallback((id: string, text: string) => {
        if (!isSupported || !text) return;

        if (currentlyPlaying === id) {
            window.speechSynthesis.cancel();
            setCurrentlyPlaying(null);
            return;
        }

        window.speechSynthesis.cancel(); // Stop any previous speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setCurrentlyPlaying(id);
        utterance.onend = () => setCurrentlyPlaying(null);
        utterance.onerror = () => setCurrentlyPlaying(null);
        
        window.speechSynthesis.speak(utterance);
    }, [isSupported, currentlyPlaying]);

    const stop = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setCurrentlyPlaying(null);
        }
    }, [isSupported]);

    return { isSupported, currentlyPlaying, play, stop };
}
