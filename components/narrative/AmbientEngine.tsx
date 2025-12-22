"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAmbientSafe } from "./AmbientContext";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface AmbientEngineProps {
    domain?: string; // Optional manual override
}

// Audio Assets Fallbacks
const FALLBACK_SOURCES: Record<string, string> = {
    default: "https://assets.mixkit.co/sfx/preview/mixkit-distant-ocean-waves-1128.mp3",
    // Control Room: Low frequency hum + electronic ambience
    "luminous-deep": "https://assets.mixkit.co/sfx/preview/mixkit-cinematic-mystery-drone-2768.mp3",
};

export default function AmbientEngine({ domain: overrideDomain }: AmbientEngineProps) {
    const ambient = useAmbientSafe();
    const pathname = usePathname();
    const [hasError, setHasError] = useState(false);

    // Audio Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prevSourceRef = useRef<string | undefined>(undefined);

    // Local Fallback State
    const [localMuted, setLocalMuted] = useState(true);
    const [localInteracted, setLocalInteracted] = useState(false);

    // 1. Determine Identity & Data
    // Extract slug from path: /luminous-deep -> luminous-deep. / -> home.
    const routeSlug = pathname === "/" ? "home" : (pathname?.split("/").slice(-1)[0] || "home");

    // Fetch Scene Data to check for custom audio
    const scene = useQuery(api.public.scenes.getScene, { slug: routeSlug });

    // 2. Resolve Configuration
    const effectiveDomain = overrideDomain || scene?.domain || (routeSlug === "luminous-deep" ? "luminous-deep" : "default");

    // Resolve Target URL
    let targetUrl = FALLBACK_SOURCES.default;

    if (overrideDomain && FALLBACK_SOURCES[overrideDomain]) {
        targetUrl = FALLBACK_SOURCES[overrideDomain];
    } else if (scene?.ambientAudioUrl) {
        targetUrl = scene.ambientAudioUrl;
    } else if (FALLBACK_SOURCES[effectiveDomain]) {
        targetUrl = FALLBACK_SOURCES[effectiveDomain];
    }

    // Resolve Volume
    const domainVolumes: Record<string, number> = {
        "luminous-deep": 0.3, // Control room: 30%
        "default": 0.4,
    };
    const baseVolume = ambient?.volume ?? (domainVolumes[effectiveDomain] || domainVolumes.default);

    const isMuted = ambient?.isMuted ?? localMuted;
    const hasInteracted = ambient?.hasInteracted ?? localInteracted;

    // 3. Audio Lifecycle & Crossfading
    useEffect(() => {
        // Initial Setup
        if (!audioRef.current) {
            const newAudio = new Audio(targetUrl);
            newAudio.loop = true;
            newAudio.volume = 0;
            newAudio.addEventListener('error', () => setHasError(true));
            audioRef.current = newAudio;
            prevSourceRef.current = targetUrl;
        }

        const audio = audioRef.current;
        if (!audio) return;

        // Source Switch Logic
        if (prevSourceRef.current !== targetUrl) {
            // console.log(`[Ambient] Sensed change. Outputting crossfade.`);

            // Fast fade out
            const fadeOut = setInterval(() => {
                if (audio.volume > 0.05) {
                    audio.volume = Math.max(0, audio.volume - 0.1);
                } else {
                    clearInterval(fadeOut);

                    // Swap
                    audio.pause();
                    audio.src = targetUrl;
                    audio.load();
                    prevSourceRef.current = targetUrl;

                    // If supposed to be playing, allow regular volume effect to fade it in
                    if (!isMuted && hasInteracted) {
                        const p = audio.play();
                        if (p) p.catch(() => { });
                    }
                }
            }, 50);

            return () => clearInterval(fadeOut);
        }

    }, [targetUrl, isMuted, hasInteracted]);

    // 4. Volume & Playback State Maintenance
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || hasError) return;

        // Check if we are mid-transition (source mismatch). If so, let the other effect handle it.
        if (prevSourceRef.current !== targetUrl) return;

        if (!isMuted && hasInteracted) {
            // Ensure playing
            if (audio.paused) {
                const p = audio.play();
                if (p) p.catch(() => { });
            }

            // Smooth Fade In to Target
            const fadeIn = setInterval(() => {
                if (audio.volume < baseVolume) {
                    audio.volume = Math.min(baseVolume, audio.volume + 0.02);
                } else if (audio.volume > baseVolume + 0.02) {
                    // Also handle volume reduction if baseVolume changed downwards
                    audio.volume = Math.max(baseVolume, audio.volume - 0.02);
                } else {
                    clearInterval(fadeIn);
                }
            }, 100);
            return () => clearInterval(fadeIn);

        } else {
            // Smooth Fade Out
            const fadeOut = setInterval(() => {
                if (audio.volume > 0.01) {
                    audio.volume = Math.max(0, audio.volume - 0.05);
                } else {
                    audio.pause();
                    clearInterval(fadeOut);
                }
            }, 50);
            return () => clearInterval(fadeOut);
        }
    }, [isMuted, hasInteracted, baseVolume, targetUrl, hasError]);


    // Cleanup
    useEffect(() => {
        return () => {
            const audio = audioRef.current;
            if (audio) {
                audio.pause();
                audio.src = "";
            }
        };
    }, []);


    // UI
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
                    // Domain styling
                    effectiveDomain === "luminous-deep" && "!bg-black/80 !border-emerald-500/30 hover:!border-emerald-500 shadow-emerald-900/20"
                )}
                aria-label={isMuted ? "Unmute Ambience" : "Mute Ambience"}
                title={`Ambience: ${effectiveDomain}`}
            >
                {isMuted ? (
                    <VolumeX size={20} className={clsx(
                        "opacity-70 group-hover:opacity-100",
                        effectiveDomain === "luminous-deep" && "text-emerald-500"
                    )} />
                ) : (
                    <Volume2 size={20} className={clsx(
                        "opacity-70 group-hover:opacity-100",
                        effectiveDomain === "luminous-deep" && "text-emerald-500 animate-pulse"
                    )} />
                )}
            </button>
        </div>
    );
}
