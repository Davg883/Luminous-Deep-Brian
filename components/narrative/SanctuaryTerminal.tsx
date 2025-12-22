"use client";

import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Mic, Send, Terminal, Cpu, BookOpen, Compass } from "lucide-react";

type AgentId = "julian" | "eleanor" | "cassie";

const AGENTS = [
    { id: "julian", name: "Julian", role: "Architect", icon: Cpu, color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: "eleanor", name: "Eleanor", role: "Historian", icon: BookOpen, color: "text-amber-400", bg: "bg-amber-400/10" },
    { id: "cassie", name: "Cassie", role: "Navigator", icon: Compass, color: "text-emerald-400", bg: "bg-emerald-400/10" }
];

export function SanctuaryTerminal({
    className,
    isControlRoom = false
}: {
    className?: string,
    isControlRoom?: boolean
}) {
    const [selectedAgent, setSelectedAgent] = useState<AgentId>("julian");
    const [messages, setMessages] = useState<{ role: "user" | "ai", text: string, agent?: string }[]>([
        { role: "ai", text: "Sanctuary Link Established. Identity Verified. How can I assist you?", agent: "system" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const askAgent = useAction(api.public.chat.askSanctuaryAgent);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setIsTyping(true);

        try {
            const response = await askAgent({ prompt: userMsg, agentId: selectedAgent });
            setMessages(prev => [...prev, { role: "ai", text: response, agent: selectedAgent }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: "ai", text: "Connection Interrupt. Signal Lost.", agent: "system" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={clsx(
            "relative w-full max-w-2xl mx-auto overflow-hidden rounded-2xl border transition-all duration-500 font-mono",
            "backdrop-blur-3xl bg-white/5 shadow-2xl",
            isControlRoom ? "border-indigo-500/30 shadow-indigo-900/20" : "border-white/10 shadow-black/20",
            className
        )}>
            {/* Header / Agent Selector */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-white/40" />
                    <span className="text-xs font-bold tracking-widest text-white/40 uppercase">Sanctuary OS v2.4</span>
                </div>
                <div className="flex gap-1 bg-black/40 rounded-lg p-1">
                    {AGENTS.map(agent => {
                        const Icon = agent.icon;
                        const isSelected = selectedAgent === agent.id;
                        return (
                            <button
                                key={agent.id}
                                onClick={() => setSelectedAgent(agent.id as AgentId)}
                                className={clsx(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-xs font-bold",
                                    isSelected ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
                                )}
                            >
                                <Icon className={clsx("w-3 h-3", isSelected ? agent.color : "text-gray-600")} />
                                {agent.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="h-[400px] overflow-y-auto p-6 space-y-6 scrollbar-hide relative" ref={scrollRef}>
                {isControlRoom && (
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={clsx(
                                "relative z-10 max-w-[85%]",
                                msg.role === "user" ? "ml-auto text-right" : "mr-auto"
                            )}
                        >
                            {msg.role === "ai" && (
                                <div className="text-[10px] uppercase font-black tracking-wider mb-1 opacity-50 text-white">
                                    {AGENTS.find(a => a.id === msg.agent)?.name || "SYSTEM"}
                                </div>
                            )}
                            <div className={clsx(
                                "px-4 py-3 text-sm leading-relaxed rounded-2xl",
                                msg.role === "user"
                                    ? "bg-white/10 text-white rounded-tr-sm border border-white/5"
                                    : "bg-black/40 text-gray-200 rounded-tl-sm border border-white/5 backdrop-blur-md"
                            )}>
                                {msg.role === "ai" && i === messages.length - 1 && isTyping ? (
                                    <span className="animate-pulse">...</span>
                                ) : (
                                    <Typewriter text={msg.text} speed={isControlRoom ? 5 : 15} />
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mr-auto max-w-[85%]">
                            <div className="text-[10px] uppercase font-black tracking-wider mb-1 opacity-50 text-white">
                                {AGENTS.find(a => a.id === selectedAgent)?.name}
                            </div>
                            <div className="px-4 py-3 text-sm rounded-2xl bg-black/40 text-gray-400 rounded-tl-sm border border-white/5 flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/20 border-t border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2 bg-black/40 rounded-xl px-4 py-2 border border-white/5 focus-within:border-indigo-500/50 transition-colors">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder={`Message ${AGENTS.find(a => a.id === selectedAgent)?.name}...`}
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-600 font-medium"
                        disabled={isTyping}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="text-gray-500 hover:text-white transition-colors disabled:opacity-30"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                {isControlRoom && (
                    <div className="mt-2 text-[9px] text-center text-indigo-500/40 uppercase tracking-[0.2em] animate-pulse">
                        SECURE CHANNEL // ENCRYPTED
                    </div>
                )}
            </div>
        </div>
    );
}

function Typewriter({ text, speed = 10 }: { text: string, speed?: number }) {
    const [displayed, setDisplayed] = useState("");

    useEffect(() => {
        let i = 0;
        setDisplayed("");
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayed(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return <span>{displayed}</span>;
}
