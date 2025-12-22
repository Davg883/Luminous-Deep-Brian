"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import clsx from "clsx";

interface RoomZone {
    id: string;
    label: string;
    path: string;
    className: string; // Tailwind positioning classes
}

const rooms: RoomZone[] = [
    { id: "workshop", label: "The Workshop", path: "/workshop", className: "top-[32%] left-[12%] w-[15%] h-[20%]" },
    { id: "lounge", label: "The Hearth", path: "/lounge", className: "top-[42%] left-[42%] w-[18%] h-[25%]" },
    { id: "study", label: "The Study", path: "/study", className: "top-[15%] left-[58%] w-[12%] h-[15%]" },
    { id: "kitchen", label: "The Galley", path: "/kitchen", className: "top-[22%] left-[72%] w-[10%] h-[15%]" },
    { id: "boathouse", label: "The Boathouse", path: "/boathouse", className: "top-[32%] left-[85%] w-[12%] h-[20%]" },
    { id: "luminous-deep", label: "Control Room", path: "/luminous-deep", className: "top-[75%] left-[42%] w-[15%] h-[15%]" }
];

interface RoomSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

// @ts-ignore
const drawVariant = {
    rest: { pathLength: 0, opacity: 0 },
    hover: {
        pathLength: 1,
        opacity: 1,
        transition: {
            pathLength: { duration: 0.8, ease: "easeInOut" },
            opacity: { duration: 0.2 }
        }
    }
};

export default function RoomSelector({ isOpen, onClose }: RoomSelectorProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden">
                    {/* SVG Filters Engine */}
                    <svg className="absolute w-0 h-0">
                        <defs>
                            <filter id="rough-paper">
                                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                                <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                            </filter>
                        </defs>
                    </svg>

                    {/* Dark Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[70]"
                    >
                        <X size={32} strokeWidth={1} />
                    </button>

                    {/* Map Container - Paper Unfold Effect */}
                    <motion.div
                        initial={{ scaleY: 0.8, opacity: 0, filter: "blur(10px)" }}
                        animate={{ scaleY: 1, opacity: 1, filter: "blur(0px)" }}
                        exit={{ scaleY: 0.9, opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Elegant ease
                        className="relative w-[95vw] md:w-[85vw] max-w-6xl aspect-[16/9] select-none shadow-2xl"
                    >
                        {/* Floorplan Image */}
                        <div
                            className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                            style={{
                                backgroundImage: "url('https://res.cloudinary.com/dptqxjhb8/image/upload/v1766417877/sanctuary_map_phqqnv.png')",
                                filter: "sepia(0.2) contrast(1.1) drop-shadow(0 20px 50px rgba(0,0,0,0.5))"
                            }}
                        />

                        {/* Room Zones */}
                        {rooms.map((room, index) => (
                            <motion.div
                                key={room.id}
                                className={`absolute ${room.className} `}
                                initial="rest"
                                whileHover="hover"
                            >
                                <Link
                                    href={room.path}
                                    onClick={onClose}
                                    className="block w-full h-full relative group cursor-pointer"
                                >
                                    {/* Sketch Highlight Layer */}
                                    <svg className="absolute inset-[-10%] w-[120%] h-[120%] overflow-visible pointer-events-none z-10">
                                        {/* The Rough Ink Draw */}
                                        <motion.rect
                                            x="10%" y="10%" width="80%" height="80%"
                                            fill="transparent"
                                            stroke="#3e5c76"
                                            strokeWidth="2"
                                            filter="url(#rough-paper)"
                                            variants={drawVariant as any}
                                        />
                                        {/* Subtle Tint Fill */}
                                        <motion.rect
                                            x="10%" y="10%" width="80%" height="80%"
                                            fill="#3e5c76"
                                            fillOpacity="0.05"
                                            filter="url(#rough-paper)"
                                            stroke="none"
                                            variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
                                        />
                                    </svg>

                                    {/* Diegetic Label (Vellum Tape) */}
                                    <motion.div
                                        initial={{ opacity: 0, y: -20, rotate: -2 }}
                                        animate={{ opacity: 1, y: 0, rotate: -1 }}
                                        transition={{ delay: 0.6 + (index * 0.1), type: "spring", stiffness: 100 }}
                                        className={clsx(
                                            "absolute -top-10 left-1/2 -translate-x-1/2 z-20 px-3 py-1",
                                            "bg-[#f5e6d3]/90 backdrop-blur-sm",
                                            "border border-[#d4c5a5]/50 shadow-sm",
                                            "font-serif text-[#1a2e40] text-sm md:text-base whitespace-nowrap tracking-wide",
                                            "group-hover:scale-105 transition-transform duration-300"
                                        )}
                                        style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                                    >
                                        {room.label}
                                    </motion.div>

                                    {/* The Ember (Moth to Flame) */}
                                    <div className={clsx(
                                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                                        "w-[3px] h-[3px] bg-stone-800 rounded-full",
                                        "animate-pulse shadow-[0_0_12px_rgba(251,146,60,0.8)]",
                                        "group-hover:opacity-0 transition-opacity duration-500"
                                    )} />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
