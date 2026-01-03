"use client";

import { motion } from "framer-motion";

interface ImagePanelProps {
    title?: string;
    imageUrl: string;
    caption?: string;
}

export function ImagePanel({ title = "Generated Visual", imageUrl, caption }: ImagePanelProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="relative overflow-hidden rounded-lg border border-slate-700/60 bg-black/70 shadow-2xl"
        >
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/60 bg-slate-900/50">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-400/80">
                    {title}
                </div>
                <div className="text-[9px] text-slate-500 font-mono">VISION OUTPUT</div>
            </div>
            <div className="relative">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full max-h-[420px] object-cover"
                    loading="lazy"
                />
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.2),transparent_35%,rgba(0,0,0,0.35))]" />
            </div>
            {caption && (
                <div className="px-4 py-3 text-xs text-slate-300 border-t border-slate-700/60 bg-slate-900/40">
                    {caption}
                </div>
            )}
        </motion.div>
    );
}
