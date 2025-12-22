"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import type { Domain } from "@/lib/types";
import { useRef } from "react";
import { useMouseProximity } from "@/hooks/useMouseProximity";

interface ObjectTriggerProps {
    x: number;
    y: number;
    label: string;
    domain?: Domain;
    isPortal?: boolean; // If true, this is a navigation portal, not a reveal
    onClick: () => void;
}

// Domain-specific colors for the glow effect
const domainColors: Record<string, string> = {
    study: "#f1e7d0",      // Warm paper gold
    workshop: "#f59e0b",   // Amber orange
    boathouse: "#06b6d4",  // Bright cyan
    home: "#fbbf24",       // Warm amber
    lounge: "#f59e0b",     // Neon amber
    kitchen: "#38bdf8",    // Sky blue
    "luminous-deep": "#0ea5e9", // CRT blue
};

export default function ObjectTrigger({ x, y, label, domain = "workshop", isPortal = false, onClick }: ObjectTriggerProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const proximity = useMouseProximity(ref, 350); // Radius of 350px

    // Diegetic Labels based on domain (or "Enter" for portals)
    const hint = isPortal ? "Enter" :
        domain === "study" ? "Observe" :
            domain === "boathouse" ? "Inspect" :
                domain === "lounge" ? "Notice" :
                    domain === "home" ? "Recall" : "Touch";

    // Get the glow color for this domain
    const glowColor = isPortal ? "#fbbf24" : (domainColors[domain] || "#ffffff");

    // Calculate visibility: minimum 0.6, scales up to 1.0 with proximity
    const baseOpacity = 0.6;
    const dynamicOpacity = baseOpacity + (proximity * 0.4);

    return (
        <button
            ref={ref}
            onClick={onClick}
            className="absolute pointer-events-auto group focus:outline-none z-30"
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={label}
        >
            <div className="relative flex items-center justify-center w-16 h-16 -translate-x-1/2 -translate-y-1/2">

                {/* Constant Subtle Pulse Ring (Always Visible) */}
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.4, 0.2, 0.4]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute w-10 h-10 rounded-full border-2"
                    style={{
                        borderColor: glowColor,
                        filter: `drop-shadow(0 0 8px ${glowColor})`,
                    }}
                />

                {/* Moth-to-Flame Glow Ring (Intensifies on Proximity) */}
                <motion.div
                    className="absolute inset-0 rounded-full blur-lg"
                    style={{
                        backgroundColor: glowColor,
                        opacity: dynamicOpacity * 0.5,
                        scale: 0.6 + (proximity * 0.6),
                        filter: `drop-shadow(0 0 12px ${glowColor})`,
                    }}
                />

                {/* Core Marker - Larger, more visible */}
                <motion.div
                    className={clsx(
                        "w-4 h-4 rounded-full border-2",
                        isPortal && "animate-pulse",
                    )}
                    style={{
                        backgroundColor: glowColor,
                        borderColor: "rgba(255,255,255,0.6)",
                        boxShadow: `0 0 15px ${glowColor}, 0 0 30px ${glowColor}`,
                        opacity: dynamicOpacity,
                    }}
                    animate={isPortal ? { scale: [1, 1.1, 1] } : {}}
                    transition={isPortal ? { duration: 1.5, repeat: Infinity } : {}}
                />

                {/* Portal outer ring indicator */}
                {isPortal && (
                    <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-12 h-12 rounded-full border-2 border-dashed"
                        style={{
                            borderColor: glowColor,
                            filter: `drop-shadow(0 0 10px ${glowColor})`,
                        }}
                    />
                )}

                {/* Diegetic Text (Whisper) with strong text-shadow for readability */}
                <div
                    className="absolute top-10 left-1/2 -translate-x-1/2 text-center pointer-events-none"
                    style={{
                        opacity: proximity > 0.7 ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                    }}
                >
                    <span
                        className={clsx(
                            "font-serif text-xs uppercase tracking-[0.2em] whitespace-nowrap font-bold",
                            isPortal ? "text-amber-200" : "text-white"
                        )}
                        style={{
                            textShadow: "0px 1px 4px rgba(0,0,0,0.9), 0px 0px 10px rgba(0,0,0,0.7)",
                        }}
                    >
                        {isPortal ? `ENTER ${(label || "ROOM").toUpperCase()}` : (label || "+")}
                    </span>
                </div>
            </div>
        </button>
    );
}
