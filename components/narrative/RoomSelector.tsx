"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

interface Room {
    id: string;
    emoji: string;
    name: string;
    subtitle: string;
    path: string;
}

const rooms: Room[] = [
    { id: "workshop", emoji: "🛠️", name: "The Workshop", subtitle: "Begin", path: "/workshop" },
    { id: "study", emoji: "🏛️", name: "The Study", subtitle: "Reflect", path: "/study" },
    { id: "boathouse", emoji: "⚓", name: "The Boathouse", subtitle: "Analyze", path: "/boathouse" },
    { id: "lounge", emoji: "🛋️", name: "The Lounge", subtitle: "Rest", path: "/lounge" },
    { id: "kitchen", emoji: "🍳", name: "The Kitchen", subtitle: "Process", path: "/kitchen" },
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
                    className="fixed inset-0 z-50 flex items-center justify-center"
                >
                    {/* Glassmorphic Backdrop */}
                    <motion.div
                        initial={{ backdropFilter: "blur(0px)" }}
                        animate={{ backdropFilter: "blur(20px)" }}
                        exit={{ backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-black/60"
                        onClick={onClose}
                    />

                    {/* Close Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: 0.2 }}
                        onClick={onClose}
                        className="absolute top-8 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-300 z-10"
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
                        className="relative z-10 flex flex-col items-center gap-6 md:gap-8"
                    >
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="font-sans text-sm md:text-base uppercase tracking-[0.3em] text-white/50 mb-4"
                        >
                            Choose Your Destination
                        </motion.h2>

                        {rooms.map((room, index) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: 0.2 + index * 0.08 }}
                            >
                                <Link
                                    href={room.path}
                                    onClick={onClose}
                                    className="group flex items-center gap-4 md:gap-6 py-2"
                                >
                                    {/* Emoji Icon */}
                                    <span className="text-3xl md:text-4xl opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                        {room.emoji}
                                    </span>

                                    {/* Room Info */}
                                    <div className="flex flex-col">
                                        <span
                                            className="font-serif text-3xl md:text-4xl lg:text-5xl text-white group-hover:text-sea transition-colors duration-300"
                                            style={{
                                                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                            }}
                                        >
                                            {room.name}
                                        </span>
                                        <span className="font-sans text-sm md:text-base text-white/40 group-hover:text-white/60 tracking-wide uppercase transition-colors duration-300">
                                            {room.subtitle}
                                        </span>
                                    </div>

                                    {/* Hover Glow Effect */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10 rounded-2xl"
                                        style={{
                                            background: 'radial-gradient(ellipse at center, rgba(54,79,107,0.15) 0%, transparent 70%)',
                                        }}
                                    />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.nav>

                    {/* Decorative Elements */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/30 font-sans text-xs tracking-widest uppercase">
                        Press Escape or click outside to close
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
