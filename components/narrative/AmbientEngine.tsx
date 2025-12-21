"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import clsx from "clsx";

export default function AmbientEngine() {
    const [isMuted, setIsMuted] = useState(true);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [hasError, setHasError] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Audio Asset (Placeholder: Waves Crashing)
    const AMBIENCE_URL = "https://actions.google.com/sounds/v1/water/waves_crashing_on_rocks.ogg";

    useEffect(() => {
        // Initialize Audio
        const audio = new Audio(AMBIENCE_URL);
        audio.loop = true;
        audio.volume = 0; // Start at 0 for fade-in

        // Error Handling
        const handleError = (e: Event | string) => {
            console.warn("Ambient Audio Failed to Load:", e);
            setHasError(true);
        };

        audio.addEventListener('error', handleError);
        audioRef.current = audio;

        return () => {
            audio.removeEventListener('error', handleError);
            audio.pause();
            audio.src = "";
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || hasError) return;

        if (!isMuted && hasInteracted) {
            // Fade In
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log("Autoplay prevented or interrupted:", e);
                    // Don't set error here, just logging, as user interaction might be needed
                });
            }

            const fadeInterval = setInterval(() => {
                if (audio.volume < 0.4) { // Max volume 0.4 for subtlety
                    audio.volume = Math.min(0.4, audio.volume + 0.01);
                } else {
                    clearInterval(fadeInterval);
                }
            }, 100); // 100ms * 40 steps = ~4 seconds fade
            return () => clearInterval(fadeInterval);
        } else {
            // Fade Out and Pause
            const fadeOutInterval = setInterval(() => {
                if (audio.volume > 0.01) {
                    audio.volume = Math.max(0, audio.volume - 0.05);
                } else {
                    audio.pause();
                    audio.currentTime = 0; // Optional: reset or keep place
                    clearInterval(fadeOutInterval);
                }
            }, 100);
            return () => clearInterval(fadeOutInterval);
        }
    }, [isMuted, hasInteracted, hasError]);

    const toggleMute = () => {
        if (hasError) return;
        setIsMuted(!isMuted);
        if (!hasInteracted) setHasInteracted(true);
    };

    if (hasError) return null; // Resiliently hide if audio is broken

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onClick={toggleMute}
                className={clsx(
                    "p-3 rounded-full glass-morphic text-white/80 hover:text-white transition-all duration-300 group",
                    !isMuted && "bg-white/10"
                )}
                aria-label={isMuted ? "Unmute Ambience" : "Mute Ambience"}
            >
                {isMuted ? (
                    <VolumeX size={20} className="opacity-70 group-hover:opacity-100" />
                ) : (
                    <Volume2 size={20} className="opacity-70 group-hover:opacity-100" />
                )}
            </button>
        </div>
    );
}
