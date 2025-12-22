"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface AmbientContextType {
    isMuted: boolean;
    volume: number;
    hasInteracted: boolean;
    setMuted: (muted: boolean) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    activateAudio: () => void;
}

const AmbientContext = createContext<AmbientContextType | undefined>(undefined);

interface AmbientProviderProps {
    children: ReactNode;
}

export function AmbientProvider({ children }: AmbientProviderProps) {
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolumeState] = useState(0.4); // Default max volume
    const [hasInteracted, setHasInteracted] = useState(false);

    const setMuted = useCallback((muted: boolean) => {
        setIsMuted(muted);
        if (!hasInteracted) setHasInteracted(true);
    }, [hasInteracted]);

    const setVolume = useCallback((newVolume: number) => {
        setVolumeState(Math.max(0, Math.min(1, newVolume)));
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
        if (!hasInteracted) setHasInteracted(true);
    }, [hasInteracted]);

    const activateAudio = useCallback(() => {
        setIsMuted(false);
        if (!hasInteracted) setHasInteracted(true);
    }, [hasInteracted]);

    return (
        <AmbientContext.Provider
            value={{
                isMuted,
                volume,
                hasInteracted,
                setMuted,
                setVolume,
                toggleMute,
                activateAudio,
            }}
        >
            {children}
        </AmbientContext.Provider>
    );
}

export function useAmbient(): AmbientContextType {
    const context = useContext(AmbientContext);
    if (context === undefined) {
        throw new Error("useAmbient must be used within an AmbientProvider");
    }
    return context;
}

// Optional hook that returns null if outside provider (for safe usage)
export function useAmbientSafe(): AmbientContextType | null {
    const context = useContext(AmbientContext);
    return context ?? null;
}
