"use client";

import { motion } from "framer-motion";

interface ArtifactCardProps {
    title?: string;
    content?: string;
    type?: "Myth" | "Signal" | "Reflection";
}

/**
 * ArtifactCard — Eleanor's Interface (Narrative/Lore)
 * 
 * A glassmorphic card for displaying artefacts, lore fragments,
 * and narrative discoveries. Uses the liquid glass aesthetic
 * with warm amber accents for archival authenticity.
 * 
 * Seaview Aesthetic:
 * - Font: Libre Baskerville (Instrument Serif-inspired narrative)
 * - Palette: Warm amber on frosted glass
 * - Effect: Light refraction, subtle hover lift
 * - Voice: Eleanor — contemplative, curatorial
 */
export function ArtifactCard({
    title = "Unknown Artefact",
    content = "The archive data is being retrieved...",
    type = "Reflection"
}: ArtifactCardProps) {
    const typeColours: Record<string, string> = {
        "Myth": "text-amber-500/60",
        "Signal": "text-cyan-500/60",
        "Reflection": "text-emerald-500/60",
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
            className="relative p-6 backdrop-blur-xl bg-white/5 border-t border-l border-white/10 rounded-lg shadow-2xl overflow-hidden"
        >
            {/* Glass Refraction Gradient */}
            <div
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                    background: "linear-gradient(125deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 40%, transparent 100%)"
                }}
            />

            {/* Type Badge */}
            <div className={`${typeColours[type ?? "Reflection"] || "text-slate-500/60"} text-[10px] uppercase tracking-[0.3em] mb-2 font-mono`}>
                {type} Archive
            </div>

            {/* Title */}
            <h3 className="font-serif text-2xl text-slate-200 mb-4 relative z-10">
                {title}
            </h3>

            {/* Content */}
            <p className="font-sans text-slate-400 leading-relaxed text-sm relative z-10">
                {content}
            </p>

            {/* Decorative Corner */}
            <div className="absolute bottom-0 right-0 w-16 h-16 opacity-10">
                <svg viewBox="0 0 64 64" className="w-full h-full">
                    <path
                        d="M64 0 L64 64 L0 64"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-amber-500"
                    />
                </svg>
            </div>
        </motion.div>
    );
}
