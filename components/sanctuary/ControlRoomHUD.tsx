"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldAlert, Cpu } from "lucide-react";
import { A2UIRenderer } from "@/components/A2UIRenderer";

import clsx from "clsx";

interface ControlRoomHUDProps {
    roomId: string;
    onChangeRoom: (newRoomId: string) => void;
    className?: string;
}

// ...

export function ControlRoomHUD({ roomId, onChangeRoom, className }: ControlRoomHUDProps) {
    const isControlRoom = roomId === "control_room";

    return (
        <>
            {/* 1. The Brain (A2UI Renderer) 
                Positioned flexibly via className, defaulting to fixed if not provided 
            */}
            <div className={clsx(
                isControlRoom ? "z-40" : "hidden",
                className || "fixed top-24 right-12 w-[400px]"
            )}>
                <A2UIRenderer roomId={roomId} onChangeRoom={onChangeRoom} />
            </div>

            {/* 2. HUD Overlays (Only visible in Control Room) */}
            <AnimatePresence>
                {isControlRoom && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 pointer-events-none z-20"
                    >
                        {/* Top Right: Security Badge */}
                        <div className="absolute top-28 right-8 flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-red-950/30 border border-red-500/20 rounded-full backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                <span className="font-mono text-[10px] text-red-400 uppercase tracking-widest">
                                    Agentic Overlay: ON
                                </span>
                            </div>
                        </div>

                        {/* Top Left: Brain Activity Indicator (Next to A2UI) */}
                        <div className="absolute top-24 left-6 flex items-center gap-2 opacity-50">
                            <Cpu className="w-4 h-4 text-emerald-500" />
                            <span className="font-mono text-[9px] text-emerald-500/60 uppercase">
                                Neural Link Stable
                            </span>
                        </div>

                        {/* Decorative Corner Brackets */}
                        <div className="absolute top-24 left-4 w-4 h-4 border-t border-l border-white/20" />
                        <div className="absolute top-24 right-4 w-4 h-4 border-t border-r border-white/20" />
                        <div className="absolute bottom-24 left-4 w-4 h-4 border-b border-l border-white/20" />
                        <div className="absolute bottom-24 right-4 w-4 h-4 border-b border-r border-white/20" />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
