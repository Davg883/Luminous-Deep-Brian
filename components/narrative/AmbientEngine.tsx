"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAmbientSafe } from "./AmbientContext";
import clsx from "clsx";

interface AmbientEngineProps {
    domain?: string; // Optional domain for domain-specific audio
}

// Audio Assets
const AUDIO_SOURCES = {
    default: "https://assets.mixkit.co/sfx/preview/mixkit-distant-ocean-waves-1128.mp3",
    coast: "https://assets.mixkit.co/sfx/preview/mixkit-distant-ocean-waves-1128.mp3",
    // Control Room: Low frequency hum + electronic ambience
    "luminous-deep": "https://assets.mixkit.co/sfx/preview/mixkit-cinematic-mystery-drone-2768.mp3",
};

export default function AmbientEngine({ domain }: AmbientEngineProps) {
    const ambient = useAmbientSafe();
    const [hasError, setHasError] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prevDomainRef = useRef<string | undefined>(undefined);

    // Fallback local state when context is not available
    const [localMuted, setLocalMuted] = useState(true);
    const [localInteracted, setLocalInteracted] = useState(false);

    // Use context values if available, otherwise fallback to local
    const isMuted = ambient?.isMuted ?? localMuted;
    const hasInteracted = ambient?.hasInteracted ?? localInteracted;

    // Domain-specific volume levels
    const domainVolumes: Record<string, number> = {
        "luminous-deep": 0.3, // Control room: 30% to not drown out storytelling
        "default": 0.4,
    };
    const baseVolume = ambient?.volume ?? (domain && domain in domainVolumes ? domainVolumes[domain] : domainVolumes.default);

    // Determine which audio source to use
    const audioSource = domain && domain in AUDIO_SOURCES
        ? AUDIO_SOURCES[domain as keyof typeof AUDIO_SOURCES]
        : AUDIO_SOURCES.default;

    useEffect(() => {
        // Initialize or switch Audio
        const audio = audioRef.current;

        // If domain changed, crossfade to new audio
        if (audio && prevDomainRef.current !== domain) {
            // Fade out current audio
            const fadeOutInterval = setInterval(() => {
                if (audio.volume > 0.01) {
                    audio.volume = Math.max(0, audio.volume - 0.05);
                } else {
                    audio.pause();
                    audio.src = audioSource;
                    audio.load();
                    clearInterval(fadeOutInterval);

                    // If not muted, start playing the new audio
                    if (!isMuted && hasInteracted) {
                        const playPromise = audio.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(e => console.log("Autoplay prevented:", e));
                        }
                    }
                }
            }, 50);

            prevDomainRef.current = domain;
            return () => clearInterval(fadeOutInterval);
        }

        // Initial setup if no audio exists
        if (!audioRef.current) {
            const newAudio = new Audio(audioSource);
            newAudio.loop = true;
            newAudio.volume = 0;

            newAudio.addEventListener('error', () => setHasError(true));
            audioRef.current = newAudio;
            prevDomainRef.current = domain;
        }

        return () => {
            // Cleanup on unmount
        };
    }, [domain, audioSource, isMuted, hasInteracted]);

    // Handle mute/unmute and volume changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || hasError) return;

        if (!isMuted && hasInteracted) {
            // Fade In
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log("Autoplay prevented or interrupted:", e);
                });
            }

            const targetVolume = baseVolume;
            const fadeInterval = setInterval(() => {
                if (audio.volume < targetVolume) {
                    audio.volume = Math.min(targetVolume, audio.volume + 0.01);
                } else {
                    clearInterval(fadeInterval);
                }
            }, 100);
            return () => clearInterval(fadeInterval);
        } else {
            // Fade Out and Pause
            const fadeOutInterval = setInterval(() => {
                if (audio.volume > 0.01) {
                    audio.volume = Math.max(0, audio.volume - 0.05);
                } else {
                    audio.pause();
                    audio.currentTime = 0;
                    clearInterval(fadeOutInterval);
                }
            }, 100);
            return () => clearInterval(fadeOutInterval);
        }
    }, [isMuted, hasInteracted, hasError, baseVolume]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const audio = audioRef.current;
            if (audio) {
                audio.pause();
                audio.src = "";
            }
        };
    }, []);

    const handleToggle = () => {
        if (hasError) return;

        if (ambient) {
            ambient.toggleMute();
        } else {
            setLocalMuted(!localMuted);
            if (!localInteracted) setLocalInteracted(true);
        }
    };

    if (hasError) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onClick={handleToggle}
                className={clsx(
                    "p-3 rounded-full glass-morphic text-white/80 hover:text-white transition-all duration-300 group",
                    !isMuted && "bg-white/10",
                    // Domain-specific button styling
                    domain === "luminous-deep" && "!bg-[var(--deep-bg)] !border-[var(--deep-accent)]/30 hover:!border-[var(--deep-accent)]"
                )}
                aria-label={isMuted ? "Unmute Ambience" : "Mute Ambience"}
            >
                {isMuted ? (
                    <VolumeX size={20} className={clsx(
                        "opacity-70 group-hover:opacity-100",
                        domain === "luminous-deep" && "text-[var(--deep-accent)]"
                    )} />
                ) : (
                    <Volume2 size={20} className={clsx(
                        "opacity-70 group-hover:opacity-100",
                        domain === "luminous-deep" && "text-[var(--deep-accent)] animate-pulse"
                    )} />
                )}
            </button>
        </div>
    );
}

