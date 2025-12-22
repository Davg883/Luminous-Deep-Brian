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
import TheDock from "@/components/layout/TheDock";
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
                    setSelectedAgentId(id);
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

            {/* Agent Swarm Modal */}
            <AnimatePresence>
                {isPitOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setIsPitOpen(false);
                                setSelectedAgentId(null);
                            }}
                            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-40"
                        >
                            {/* Wood frame */}
                            <div className="absolute inset-0 -m-3 rounded-xl bg-gradient-to-br from-amber-900/50 via-amber-800/40 to-amber-900/50 border border-amber-700/40" />

                            <div className="relative terminal-panel rounded-lg overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-[var(--deep-accent)]/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--deep-accent)]/10 border border-[var(--deep-accent)]/30 flex items-center justify-center">
                                            <Activity className="w-5 h-5 text-[var(--deep-accent)]" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-[var(--deep-accent)] tracking-wide terminal-glow">
                                                AGENT SWARM
                                            </h2>
                                            <p className="text-xs text-zinc-500">
                                                {agents?.filter(a => a.isActive).length ?? 0} active • {agents?.length ?? 0} total
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsPitOpen(false);
                                            setSelectedAgentId(null);
                                        }}
                                        className="p-2 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                                    {selectedAgent ? (
                                        // Agent Detail View
                                        <div className="space-y-4">
                                            <button
                                                onClick={() => setSelectedAgentId(null)}
                                                className="text-xs text-[var(--deep-accent)] hover:underline flex items-center gap-1"
                                            >
                                                ← Back to swarm
                                            </button>

                                            <div className="flex items-start gap-4">
                                                <div className={clsx(
                                                    "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold",
                                                    "bg-gradient-to-br from-[var(--deep-accent)]/20 to-[var(--deep-glow)]/10",
                                                    "border border-[var(--deep-accent)]/30"
                                                )}>
                                                    {selectedAgent.name[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={clsx(
                                                        "text-xl font-bold",
                                                        selectedAgent.voice === "julian" && "text-sky-400",
                                                        selectedAgent.voice === "eleanor" && "text-amber-100",
                                                        selectedAgent.voice === "cassie" && "text-amber-400",
                                                        !selectedAgent.voice && "text-white"
                                                    )}>
                                                        {selectedAgent.name}
                                                    </h3>
                                                    <p className="text-sm text-zinc-400">{selectedAgent.role}</p>
                                                    <div className={clsx(
                                                        "inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-xs",
                                                        selectedAgent.isActive
                                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                            : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
                                                    )}>
                                                        <div className={clsx(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            selectedAgent.isActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                                                        )} />
                                                        {selectedAgent.isActive ? "ONLINE" : "OFFLINE"}
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedAgent.description && (
                                                <p className="text-sm text-zinc-400 border-l-2 border-[var(--deep-accent)]/30 pl-4">
                                                    {selectedAgent.description}
                                                </p>
                                            )}

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Capabilities</div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {selectedAgent.capabilities.map((cap: string) => (
                                                            <span key={cap} className="px-2 py-0.5 bg-[var(--deep-dim)] rounded text-xs text-zinc-300">
                                                                {cap}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Tools</div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {selectedAgent.tools.map((tool: string) => (
                                                            <span key={tool} className="px-2 py-0.5 bg-[var(--deep-accent)]/10 rounded text-xs text-[var(--deep-accent)]">
                                                                {tool}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Autonomy Level</div>
                                                <div className="flex items-center gap-2">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={clsx(
                                                                "w-8 h-2 rounded-full",
                                                                level <= selectedAgent.autonomy
                                                                    ? "bg-[var(--deep-glow)]"
                                                                    : "bg-[var(--deep-dim)]"
                                                            )}
                                                        />
                                                    ))}
                                                    <span className="text-xs text-[var(--deep-glow)] ml-2">
                                                        {["Reactive", "Guided", "Balanced", "Proactive", "Autonomous"][selectedAgent.autonomy - 1]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Agent List
                                        <div className="space-y-2">
                                            {!agents || agents.length === 0 ? (
                                                <div className="text-center py-8 text-zinc-500">
                                                    <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                                    <p>No agents in the swarm</p>
                                                    <p className="text-xs mt-1">Run seedAll to initialize</p>
                                                </div>
                                            ) : (
                                                agents.map((agent) => (
                                                    <motion.button
                                                        key={agent._id}
                                                        onClick={() => setSelectedAgentId(agent._id)}
                                                        whileHover={{ x: 4 }}
                                                        className={clsx(
                                                            "w-full flex items-center justify-between p-3 rounded-lg",
                                                            "bg-[var(--deep-dim)]/30 border border-white/5",
                                                            "hover:bg-[var(--deep-dim)]/50 hover:border-[var(--deep-accent)]/20",
                                                            "transition-all text-left"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={clsx(
                                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                                                                "bg-gradient-to-br",
                                                                agent.voice === "julian" && "from-sky-500/20 to-sky-900/20 text-sky-400",
                                                                agent.voice === "eleanor" && "from-amber-500/20 to-amber-900/20 text-amber-100",
                                                                agent.voice === "cassie" && "from-orange-500/20 to-orange-900/20 text-amber-400",
                                                                !agent.voice && "from-zinc-500/20 to-zinc-900/20 text-zinc-400"
                                                            )}>
                                                                {agent.name[0]}
                                                            </div>
                                                            <div>
                                                                <div className={clsx(
                                                                    "font-medium",
                                                                    agent.voice === "julian" && "text-sky-400",
                                                                    agent.voice === "eleanor" && "text-amber-100",
                                                                    agent.voice === "cassie" && "text-amber-400",
                                                                    !agent.voice && "text-white"
                                                                )}>
                                                                    {agent.name}
                                                                </div>
                                                                <div className="text-xs text-zinc-500">
                                                                    {agent.role} • {agent.homeSpace?.title || "Unassigned"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className={clsx(
                                                                "w-2 h-2 rounded-full",
                                                                agent.isActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                                                            )} />
                                                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                                                        </div>
                                                    </motion.button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Navigation Dock */}
            <TheDock />

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
