"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Cpu, BookOpen, Compass, ShieldCheck, User } from "lucide-react";
import { Role } from "@copilotkit/runtime-client-gql";

type AgentId = "brian" | "julian" | "eleanor" | "cassie";

const AGENTS = [
    { id: "brian", name: "Sovereign", role: "System Core", icon: ShieldCheck, color: "text-emerald-400" },
    { id: "julian", name: "Julian", role: "Architect", icon: Cpu, color: "text-blue-400" },
    { id: "eleanor", name: "Eleanor", role: "Historian", icon: BookOpen, color: "text-amber-400" },
    { id: "cassie", name: "Cassie", role: "Navigator", icon: Compass, color: "text-cyan-400" }
];

interface SanctuaryTerminalProps {
    className?: string;
    isControlRoom?: boolean;
    messages: any[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
}

export function SanctuaryTerminal({
    className,
    isControlRoom = false,
    messages,
    isLoading,
    onSendMessage
}: SanctuaryTerminalProps) {
    const [selectedAgent, setSelectedAgent] = useState<AgentId>("brian");
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isLoading]);

    const handleSend = () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput("");

        // Contextualize
        const agentName = AGENTS.find(a => a.id === selectedAgent)?.name || "System";
        const contextualizedMsg = `[CHANNEL: ${agentName.toUpperCase()}] ${userMsg}`;

        onSendMessage(contextualizedMsg);
    };

    return (
        <div className={clsx(
            "relative w-full overflow-hidden rounded-lg border transition-all duration-500 font-mono flex flex-col",
            "bg-black/90 backdrop-blur-xl shadow-2xl",
            "border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)]",
            className
        )}>
            {/* Header / Agent Selector */}
            <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-black/40">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-500/80 uppercase">
                        SANCTUARY OS V2.6 // UPLINK: ACTIVE
                    </span>
                </div>
                <div className="flex gap-1">
                    {AGENTS.map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent.id as AgentId)}
                            className={clsx(
                                "w-6 h-6 flex items-center justify-center rounded transition-all",
                                selectedAgent === agent.id ? "bg-slate-800 text-white" : "text-slate-600 hover:text-slate-400"
                            )}
                            title={agent.name}
                        >
                            <agent.icon className="w-3 h-3" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 min-h-[300px] overflow-y-auto p-4 space-y-3 scrollbar-hide relative text-xs" ref={scrollRef}>
                {/* CRT Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

                {(!messages || messages.length === 0) && (
                    <div className="h-full flex items-center justify-center opacity-30">
                        <span className="animate-pulse">AWAITING INPUT...</span>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {(messages || []).map((msg, i) => {
                        const m = msg as any;
                        const role = m.role || "system";
                        const content = m.content || m.text || (typeof m === 'string' ? m : "");

                        // V2.6 FIX: ALWAYS render both User and Assistant messages
                        // Empty content means tool execution - show placeholder
                        const displayContent = content || "[EXECUTING PROTOCOL...]";

                        const isUser = role === "user" || role === Role.User;
                        const isAssistant = role === "assistant" || role === Role.Assistant;

                        return (
                            <motion.div
                                key={m.id || i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="relative z-10 flex gap-2 items-start"
                            >
                                {/* Message Content */}
                                <div className={clsx(
                                    "flex-1 px-3 py-2 rounded font-medium leading-relaxed",
                                    isUser
                                        ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                                        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                )}>
                                    <span className="opacity-50 text-[10px] uppercase mr-2 tracking-wider font-bold">
                                        {isUser ? <>{'>>'} OPR:</> : <>{'>>'} BRN:</>}
                                    </span>
                                    <span>{displayContent}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Loading Indicator */}
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-start">
                        <div className="flex-1 px-3 py-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            <span className="opacity-50 text-[10px] uppercase mr-2 tracking-wider font-bold">
                                {'>>'} BRN:
                            </span>
                            <span className="animate-pulse">[PROCESSING...]</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-black border-t border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold text-xs">{'>>'}</span>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="ENTER_COMMAND..."
                        className="flex-1 bg-transparent border-none outline-none text-emerald-400 text-xs font-mono placeholder-slate-700 uppercase tracking-wider"
                        disabled={isLoading}
                        autoFocus
                    />
                </div>
            </div>
        </div>
    );
}
