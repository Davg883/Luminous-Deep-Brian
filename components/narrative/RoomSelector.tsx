"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, ChevronDown } from "lucide-react";

interface Room {
    id: string;
    emoji: string;
    name: string;
    subtitle: string;
    path: string;
    glowColor: string;
}

const rooms: Room[] = [
    { id: "home", emoji: "🏡", name: "The Arrival", subtitle: "Home", path: "/home", glowColor: "#fbbf24" },
    { id: "workshop", emoji: "🛠️", name: "The Workbench", subtitle: "Create", path: "/workshop", glowColor: "#f59e0b" },
    { id: "study", emoji: "🏛️", name: "The Luminous Desk", subtitle: "Reflect", path: "/study", glowColor: "#f1e7d0" },
    { id: "boathouse", emoji: "⚓", name: "The Anchorage", subtitle: "Analyze", path: "/boathouse", glowColor: "#06b6d4" },
    { id: "lounge", emoji: "🛋️", name: "The Hearth", subtitle: "Rest", path: "/lounge", glowColor: "#f59e0b" },
    { id: "kitchen", emoji: "🍳", name: "The Galley", subtitle: "Process", path: "/kitchen", glowColor: "#38bdf8" },
];

interface RoomSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RoomSelector({ isOpen, onClose }: RoomSelectorProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center"
                >
                    {/* Glassmorphic Backdrop with intense blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 backdrop-blur-2xl"
                        onClick={onClose}
                    />

                    {/* Close Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: 0.2 }}
                        onClick={onClose}
                        className="absolute top-8 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-300 z-10 border border-white/10"
                        aria-label="Close room selector"
                    >
                        <X size={24} />
                    </motion.button>

                    {/* Room List */}
                    <motion.nav
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative z-10 flex flex-col items-center gap-4 md:gap-6 px-8 max-h-[70vh] overflow-y-auto"
                    >
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="font-sans text-sm md:text-base uppercase tracking-[0.3em] text-white/50 mb-6"
                        >
                            Choose Your Destination
                        </motion.h2>

                        {/* Room Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {rooms.map((room, index) => (
                                <motion.div
                                    key={room.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: 0.2 + index * 0.06 }}
                                    className="relative"
                                >
                                    <Link
                                        href={room.path}
                                        onClick={onClose}
                                        className="group flex items-center gap-4 md:gap-5 py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                                    >
                                        {/* Emoji Icon with glow */}
                                        <span
                                            className="text-3xl md:text-4xl opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                                            style={{
                                                filter: `drop-shadow(0 0 8px ${room.glowColor})`,
                                            }}
                                        >
                                            {room.emoji}
                                        </span>

                                        {/* Room Info */}
                                        <div className="flex flex-col">
                                            <span
                                                className="font-serif text-xl md:text-2xl lg:text-3xl text-white group-hover:text-white transition-colors duration-300"
                                                style={{
                                                    textShadow: `0 2px 20px ${room.glowColor}40`,
                                                }}
                                            >
                                                {room.name}
                                            </span>
                                            <span className="font-sans text-xs md:text-sm text-white/40 group-hover:text-white/60 tracking-widest uppercase transition-colors duration-300">
                                                {room.subtitle}
                                            </span>
                                        </div>

                                        {/* Hover Glow Effect */}
                                        <div
                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl -z-10"
                                            style={{
                                                background: `radial-gradient(ellipse at left, ${room.glowColor}15 0%, transparent 60%)`,
                                            }}
                                        />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.nav>

                    {/* Secret Entrance to the Luminous Deep */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.8 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
                    >
                        {/* Escape hint */}
                        <span className="text-white/20 font-sans text-xs tracking-widest uppercase">
                            Press Escape to close
                        </span>

                        {/* The Hidden Descent */}
                        <Link
                            href="/luminous-deep"
                            onClick={onClose}
                            className="group flex items-center gap-2 text-white/20 hover:text-[#0ea5e9] transition-all duration-500"
                        >
                            <ChevronDown
                                size={14}
                                className="animate-bounce opacity-50 group-hover:opacity-100"
                            />
                            <span
                                className="font-mono text-[10px] md:text-xs tracking-wider uppercase"
                                style={{
                                    textShadow: "0 0 10px rgba(14, 165, 233, 0)",
                                    transition: "text-shadow 0.5s ease",
                                }}
                            >
                                Descend to the Luminous Deep
                            </span>
                            <ChevronDown
                                size={14}
                                className="animate-bounce opacity-50 group-hover:opacity-100"
                            />
                        </Link>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
