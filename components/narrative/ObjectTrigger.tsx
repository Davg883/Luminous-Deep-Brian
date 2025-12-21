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
    onClick: () => void;
}

export default function ObjectTrigger({ x, y, label, domain = "workshop", onClick }: ObjectTriggerProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const proximity = useMouseProximity(ref, 350); // Radius of 350px

    // Diegetic Labels based on domain
    const hint = domain === "study" ? "Observe" :
        domain === "boathouse" ? "Inspect" :
            domain === "home" ? "Recall" : "Touch";

    return (
        <button
            ref={ref}
            onClick={onClick}
            className="absolute pointer-events-auto group focus:outline-none z-30"
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={label}
        >
            <div className="relative flex items-center justify-center w-12 h-12 -translate-x-1/2 -translate-y-1/2">

                {/* Moth-to-Flame Glow Ring */}
                <motion.div
                    className={clsx(
                        "absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        domain === "study" && "bg-white/40",
                        domain === "workshop" && "bg-orange-400/30",
                        domain === "boathouse" && "bg-sky-400/30",
                        domain === "home" && "bg-amber-100/30"
                    )}
                    style={{
                        opacity: proximity * 0.8, // Intensifies as we get closer
                        scale: 0.5 + (proximity * 0.8), // Grows as we get closer
                    }}
                />

                {/* Core Marker (Minimalist) */}
                <div
                    className={clsx(
                        "w-3 h-3 rounded-full transition-transform duration-300",
                        "shadow-[0_0_10px_rgba(255,255,255,0.5)]",
                        domain === "study" && "bg-study-paper/80",
                        domain === "workshop" && "bg-workshop-accent/80",
                        domain === "home" && "bg-white/80",
                        domain === "boathouse" && "bg-boat-glow/80"
                    )}
                />

                {/* Diegetic Text (Whisper) */}
                <div
                    className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none"
                    style={{ opacity: proximity > 0.85 ? 1 : 0, transition: 'opacity 0.3s ease' }}
                >
                    <span className="font-serif text-[10px] uppercase tracking-[0.2em] text-white/90 drop-shadow-md whitespace-nowrap">
                        {hint}
                    </span>
                </div>
            </div>
        </button>
    );
}
