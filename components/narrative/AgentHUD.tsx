"use client";

import { useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import clsx from "clsx";
import {
    Terminal,
    Activity,
    Cpu,
    Radio,
    Zap,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

// Types for Runs (until Convex regenerates)
interface RunLog {
    timestamp: number;
    stepOrder: number;
    agentId?: Id<"agents">;
    message: string;
    level: "info" | "warn" | "error" | "debug";
}

interface Run {
    _id: Id<"runs">;
    workflowId: Id<"workflows">;
    status: "pending" | "running" | "completed" | "failed" | "cancelled";
    logs: RunLog[];
    startedAt: number;
    completedAt?: number;
}

interface Agent {
    _id: Id<"agents">;
    name: string;
    role: string;
    isActive: boolean;
    voice?: string;
}

const statusIcons = {
    pending: Clock,
    running: Activity,
    completed: CheckCircle2,
    failed: XCircle,
    cancelled: AlertCircle,
};

const statusColors = {
    pending: "text-amber-400",
    running: "text-sky-400 animate-pulse",
    completed: "text-emerald-400",
    failed: "text-red-400",
    cancelled: "text-zinc-400",
};

interface AgentHUDProps {
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    agents?: Agent[];
    onAgentSelect?: (agentId: Id<"agents">) => void;
}

export default function AgentHUD({
    isExpanded = false,
    onToggleExpand,
    agents = [],
    onAgentSelect
}: AgentHUDProps) {
    // Initialize as null to avoid hydration mismatch - will be set client-side only
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [terminalLines, setTerminalLines] = useState<string[]>([]);

    // Simulated terminal output (would connect to real runs data)
    useEffect(() => {
        const bootSequence = [
            "> LUMINOUS DEEP CONTROL v0.1.0",
            "> Initializing agent subsystems...",
            "> JULIAN [ONLINE] :: Boathouse",
            "> ELEANOR [ONLINE] :: Study",
            "> CASSIE [ONLINE] :: Workshop",
            "> All systems nominal.",
            "> Awaiting instructions...",
        ];

        let lineIndex = 0;
        const interval = setInterval(() => {
            if (lineIndex < bootSequence.length) {
                setTerminalLines(prev => [...prev, bootSequence[lineIndex]]);
                lineIndex++;
            } else {
                clearInterval(interval);
            }
        }, 400);

        return () => clearInterval(interval);
    }, []);

    // Clock updater - only starts after mount to avoid hydration mismatch
    useEffect(() => {
        setCurrentTime(new Date()); // Set initial time on client
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(clockInterval);
    }, []);

    const formatTime = (date: Date | null) => {
        if (!date) return "--:--:--";
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-40 font-mono">
            {/* CRT Scanlines Overlay */}
            <div className="absolute inset-0 crt-scanlines opacity-20" />

            {/* Top Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
                <div className="flex items-center justify-between px-6 h-full">
                    {/* Left: System Status */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-emerald-400 terminal-glow tracking-wider">
                                SYSTEM ACTIVE
                            </span>
                        </div>
                        <div className="text-xs text-zinc-500">|</div>
                        <div className="flex items-center gap-2 text-xs text-[var(--deep-accent)]">
                            <Cpu className="w-3 h-3" />
                            <span>{agents.filter(a => a.isActive).length} AGENTS ONLINE</span>
                        </div>
                    </div>

                    {/* Center: Clock */}
                    <div className="text-lg text-[var(--deep-glow)] terminal-amber-glow tracking-widest">
                        {formatTime(currentTime)}
                    </div>

                    {/* Right: Controls */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <Radio className="w-3 h-3" />
                            <span>DOMAIN: CONTROL</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Left Panel: Terminal Output */}
            <motion.div
                initial={{ x: -400 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute left-4 top-20 w-80 pointer-events-auto"
            >
                {/* Wood Frame Effect */}
                <div className="relative">
                    {/* Outer wooden frame */}
                    <div className="absolute inset-0 -m-2 rounded-lg bg-gradient-to-br from-amber-900/40 via-amber-800/30 to-amber-900/40 border border-amber-700/30" />

                    {/* Glass panel */}
                    <div className="relative terminal-panel p-4 rounded-lg overflow-hidden">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--deep-accent)]/20">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-[var(--deep-accent)]" />
                                <span className="text-xs text-[var(--deep-accent)] tracking-wider">SYSTEM LOG</span>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                                <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                            </div>
                        </div>

                        {/* Terminal Content */}
                        <div className="h-48 overflow-y-auto scrollbar-hide space-y-1">
                            {terminalLines.map((line, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={clsx(
                                        "text-xs leading-relaxed",
                                        line.includes("[ONLINE]") && "text-emerald-400",
                                        line.includes(">") && !line.includes("[") && "text-[var(--deep-text)]",
                                        !line.includes("[ONLINE]") && !line.startsWith(">") && "text-zinc-400"
                                    )}
                                >
                                    {line}
                                </motion.div>
                            ))}
                            <motion.span
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="text-[var(--deep-accent)]"
                            >
                                _
                            </motion.span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right Panel: Agent Status */}
            <motion.div
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="absolute right-4 top-20 w-72 pointer-events-auto"
            >
                <div className="relative">
                    {/* Outer wooden frame */}
                    <div className="absolute inset-0 -m-2 rounded-lg bg-gradient-to-br from-amber-900/40 via-amber-800/30 to-amber-900/40 border border-amber-700/30" />

                    <div className="relative terminal-panel p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--deep-accent)]/20">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[var(--deep-glow)]" />
                                <span className="text-xs text-[var(--deep-glow)] tracking-wider">AGENT SWARM</span>
                            </div>
                            <button
                                onClick={onToggleExpand}
                                className="text-zinc-500 hover:text-[var(--deep-accent)] transition-colors"
                            >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Agent List */}
                        <div className="space-y-2">
                            {agents.length === 0 ? (
                                <div className="text-xs text-zinc-500 text-center py-4">
                                    No agents registered
                                </div>
                            ) : (
                                agents.slice(0, isExpanded ? agents.length : 3).map((agent) => (
                                    <motion.button
                                        key={agent._id}
                                        onClick={() => onAgentSelect?.(agent._id)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={clsx(
                                            "w-full flex items-center justify-between p-2 rounded",
                                            "bg-[var(--deep-dim)]/50 border border-white/5",
                                            "hover:border-[var(--deep-accent)]/30 transition-all"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={clsx(
                                                "w-2 h-2 rounded-full",
                                                agent.isActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                                            )} />
                                            <span className={clsx(
                                                "text-sm font-medium",
                                                agent.voice === "julian" && "text-sky-400",
                                                agent.voice === "eleanor" && "text-amber-100",
                                                agent.voice === "cassie" && "text-amber-400",
                                                !agent.voice && "text-zinc-300"
                                            )}>
                                                {agent.name}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                            {agent.role}
                                        </span>
                                    </motion.button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Bottom: Circular Ring Display */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none">
                {/* Outer glowing ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 rounded-full border border-[var(--deep-accent)]/30"
                    style={{
                        boxShadow: "0 0 30px rgba(14, 165, 233, 0.1), inset 0 0 30px rgba(14, 165, 233, 0.05)"
                    }}
                >
                    {/* Orbital dots */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--deep-accent)]" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--deep-glow)]" />
                </motion.div>

                {/* Inner ring */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[var(--deep-glow)]/20"
                />

                {/* Center core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--deep-accent)]/10 border border-[var(--deep-accent)]/30 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[var(--deep-accent)]" />
                </div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[var(--deep-accent)]/30" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-[var(--deep-accent)]/30" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-[var(--deep-glow)]/30" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[var(--deep-glow)]/30" />
        </div>
    );
}
