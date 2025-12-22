"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Id } from "@/convex/_generated/dataModel";
import AgentHUD from "@/components/narrative/AgentHUD";
import AmbientEngine from "@/components/narrative/AmbientEngine";
import RevealCard from "@/components/narrative/RevealCard";
import SanctuaryCompass from "@/components/layout/SanctuaryCompass";
import EdgeNav from "@/components/narrative/EdgeNav";
import { SanctuaryTerminal } from "@/components/narrative/SanctuaryTerminal";
import {
    Zap,
    Radio,
    X,
    ChevronRight,
    Terminal,
    Cpu,
    Activity,
} from "lucide-react";

// Types (until Convex regenerates)
interface Agent {
    _id: Id<"agents">;
    name: string;
    role: string;
    description?: string;
    capabilities: string[];
    tools: string[];
    autonomy: number;
    voice?: string;
    isActive: boolean;
    homeSpace?: {
        slug: string;
        title: string;
        domain: string;
    } | null;
}

interface Artefact {
    _id: Id<"reveals">;
    title: string;
    content: string;
    type: "text" | "audio" | "video" | "image";
    truthMode?: "factual" | "creative";
    artefactType?: "prompt" | "regulation" | "note" | "script";
}

export default function LuminousDeepPage() {
    const [isPitOpen, setIsPitOpen] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState<Id<"agents"> | null>(null);
    const [isHUDExpanded, setIsHUDExpanded] = useState(false);
    const [showArtefact, setShowArtefact] = useState(false);

    // Fetch scene data from database
    const scene = useQuery(api.public.scenes.getScene, { slug: "luminous-deep" });

    // Fetch agents from public API
    const agentsData = useQuery((api as any).public.scenes.listAgents, {});
    const agents = (agentsData && Array.isArray(agentsData) ? agentsData : []) as Agent[];

    // Selected agent details
    const selectedAgent = agents?.find(a => a._id === selectedAgentId);

    // Pit pulsing animation
    const [pitPulse, setPitPulse] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setPitPulse(prev => (prev + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Loading state - terminal boot screen
    if (scene === undefined) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center font-mono">
                <div className="text-center">
                    <div className="w-16 h-16 border-2 border-[var(--deep-accent)]/50 rounded-full mx-auto mb-6 animate-pulse flex items-center justify-center">
                        <Zap className="w-8 h-8 text-[var(--deep-accent)] animate-pulse" />
                    </div>
                    <p className="text-[var(--deep-accent)] text-sm tracking-widest uppercase animate-pulse">
                        INITIALIZING CONTROL ROOM...
                    </p>
                    <p className="text-zinc-600 text-xs mt-2">Connecting to Luminous Deep</p>
                </div>
            </div>
        );
    }

    // Get background media URL from database (handles both images and videos)
    const backgroundMediaUrl = scene?.backgroundMediaUrl;
    const isVideo = backgroundMediaUrl?.match(/\.(mp4|webm|mov)$/i);
    const shouldLoop = scene?.shouldLoop ?? true; // Default to loop if not specified

    return (
        <div className="relative min-h-screen bg-[var(--deep-bg)] overflow-hidden font-mono">
            {/* Background Media - Data Driven */}
            <div className="fixed inset-0 z-0">
                {isVideo ? (
                    <video
                        key={backgroundMediaUrl}
                        src={backgroundMediaUrl}
                        autoPlay
                        loop={shouldLoop}
                        muted
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover opacity-30"
                        style={{ filter: "saturate(0.3) brightness(0.4)" }}
                    />
                ) : backgroundMediaUrl ? (
                    <img
                        key={backgroundMediaUrl}
                        src={backgroundMediaUrl}
                        alt="Control Room"
                        className="w-full h-full object-cover opacity-30"
                        style={{ filter: "saturate(0.3) brightness(0.4)" }}
                    />
                ) : (
                    <div className="w-full h-full bg-black" />
                )}
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/60 to-black/90" />
            </div>

            {/* CRT Scanlines */}
            <div className="fixed inset-0 z-10 pointer-events-none crt-scanlines opacity-30" />

            {/* Agent HUD Overlay */}
            <AgentHUD
                agents={agents || []}
                isExpanded={isHUDExpanded}
                onToggleExpand={() => setIsHUDExpanded(!isHUDExpanded)}
                onAgentSelect={(id) => {
                    // Just open the terminal, agent selection happens inside
                    setIsPitOpen(true);
                }}
            />

            {/* THE PIT - Central Hotspot */}
            <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none">
                <motion.button
                    onClick={() => setIsPitOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="pointer-events-auto relative"
                >
                    {/* Outer Ring - Pulsing */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 -m-8 rounded-full border-2 border-[var(--deep-accent)]/30"
                    />

                    {/* Middle Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 -m-4 rounded-full border border-[var(--deep-glow)]/20"
                    />

                    {/* The Pit Core */}
                    <div
                        className={clsx(
                            "w-32 h-32 rounded-full relative overflow-hidden",
                            "bg-gradient-radial from-[var(--deep-accent)]/20 via-[var(--deep-bg)] to-black",
                            "border-2 border-[var(--deep-accent)]/50",
                            "shadow-[0_0_60px_rgba(14,165,233,0.3),inset_0_0_30px_rgba(14,165,233,0.2)]",
                            "hover:border-[var(--deep-accent)] hover:shadow-[0_0_80px_rgba(14,165,233,0.5)]",
                            "transition-all duration-500 cursor-pointer"
                        )}
                    >
                        {/* Inner glow */}
                        <div className="absolute inset-4 rounded-full bg-[var(--deep-accent)]/5 border border-[var(--deep-accent)]/20" />

                        {/* Center Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-[var(--deep-accent)] drop-shadow-[0_0_10px_rgba(14,165,233,0.8)]" />
                        </div>

                        {/* Animated ring */}
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 rounded-full border border-dashed border-[var(--deep-accent)]/30"
                        />
                    </div>

                    {/* Label */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="text-xs text-[var(--deep-accent)] tracking-widest uppercase terminal-glow">
                            THE PIT
                        </span>
                    </div>
                </motion.button>
            </div>

            {/* Sanctuary Terminal Modal */}
            <AnimatePresence>
                {isPitOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPitOpen(false)}
                            className="fixed inset-0 z-30 bg-black/80 backdrop-blur-md"
                        />

                        {/* Terminal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="w-full max-w-3xl pointer-events-auto">
                                <SanctuaryTerminal isControlRoom={true} />
                                <button
                                    onClick={() => setIsPitOpen(false)}
                                    className="mt-4 mx-auto block text-zinc-500 hover:text-white text-xs uppercase tracking-widest transition-colors"
                                >
                                    Close Terminal
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Navigation Dock */}
            <SanctuaryCompass />
            <EdgeNav currentSlug="luminous-deep" />

            {/* Domain-Specific Ambient Audio */}
            <AmbientEngine domain="luminous-deep" />

            {/* RevealCard for Artefacts (if needed) */}
            <RevealCard
                isOpen={showArtefact}
                onClose={() => setShowArtefact(false)}
                title="System Artefact"
                content="This is a test artefact from the control room."
                type="text"
                domain="luminous-deep"
                truthMode="factual"
            />
        </div>
    );
}
