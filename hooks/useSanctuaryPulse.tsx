"use client";

import React, { useEffect, useRef, ReactNode, CSSProperties } from "react";
import { useAudioSovereignSafe } from "@/components/narrative/AudioSovereign";

/**
 * useSanctuaryPulse
 * 
 * A hook that provides a ref to attach to any HTML element.
 * The element will automatically pulse with the 40Hz audio amplitude,
 * creating a "breathing sanctuary" effect.
 * 
 * Usage:
 * ```tsx
 * const pulseRef = useSanctuaryPulse<HTMLDivElement>();
 * 
 * return (
 *   <div 
 *     ref={pulseRef} 
 *     className="sanctuary-breathing sanctuary-breathing-cyan"
 *   >
 *     This card breathes with the 40Hz beat
 *   </div>
 * );
 * ```
 */
export function useSanctuaryPulse<T extends HTMLElement>() {
    const elementRef = useRef<T>(null);
    const audio = useAudioSovereignSafe();

    useEffect(() => {
        const element = elementRef.current;
        if (!element || !audio) return;

        // Update CSS custom property on each frame
        const updatePulse = () => {
            element.style.setProperty("--pulse-intensity", audio.lowFrequencyAmplitude.toString());
        };

        // Use requestAnimationFrame for smooth updates
        let animationFrame: number;
        const animate = () => {
            updatePulse();
            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [audio]);

    return elementRef;
}

/**
 * useSanctuaryGlow
 * 
 * Returns the current 40Hz amplitude value (0-1) for custom visual effects.
 * 
 * Usage:
 * ```tsx
 * const { amplitude, isPlaying } = useSanctuaryGlow();
 * 
 * return (
 *   <div style={{ 
 *     boxShadow: `0 0 ${30 * amplitude}px rgba(14, 165, 233, ${amplitude})` 
 *   }}>
 *     Custom glow effect
 *   </div>
 * );
 * ```
 */
export function useSanctuaryGlow() {
    const audio = useAudioSovereignSafe();

    return {
        amplitude: audio?.lowFrequencyAmplitude ?? 0,
        isPlaying: audio?.isPlaying ?? false,
        isMuted: audio?.isMuted ?? true,
        hasInteracted: audio?.hasInteracted ?? false,
        currentRoom: audio?.currentRoom ?? "default",
    };
}

/**
 * SanctuaryBreathingWrapper
 * 
 * A wrapper component that adds the breathing sanctuary effect to its children.
 * 
 * Usage:
 * ```tsx
 * return (
 *   <SanctuaryBreathingWrapper 
 *     glowColor="cyan" 
 *     className="your-card-classes"
 *   >
 *     <CardContent />
 *   </SanctuaryBreathingWrapper>
 * );
 * ```
 */
interface SanctuaryBreathingWrapperProps {
    children: ReactNode;
    glowColor?: "cyan" | "amber" | "emerald";
    className?: string;
    style?: CSSProperties;
}

export function SanctuaryBreathingWrapper({
    children,
    glowColor = "cyan",
    className = "",
    style = {},
}: SanctuaryBreathingWrapperProps) {
    const pulseRef = useSanctuaryPulse<HTMLDivElement>();
    const glowClasses = {
        cyan: "sanctuary-breathing-cyan",
        amber: "sanctuary-breathing-amber",
        emerald: "sanctuary-breathing-emerald",
    };

    return (
        <div
            ref={pulseRef}
            className={`sanctuary-breathing ${glowClasses[glowColor]} ${className}`}
            style={style}
        >
            {children}
        </div>
    );
}
