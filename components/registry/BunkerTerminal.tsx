"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Clock } from "lucide-react";

interface BunkerTerminalProps {
    header?: string;
    lines?: string[];
    glitchLevel?: number;
}

/**
 * LiveClock — 03/01/2026 Live System Time
 * Anchors the user in the present reality.
 */
function LiveClock() {
    const [time, setTime] = useState<string>("");

    useEffect(() => {
        // Initial set
        const update = () => {
            const now = new Date();
            // en-GB: 03/01/2026, 15:30:45
            setTime(now.toLocaleString("en-GB", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit", second: "2-digit",
                hour12: false
            }).replace(",", ""));
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!time) return <span className="opacity-0">INIT...</span>;

    return (
        <div className="flex items-center gap-2 text-[10px] text-green-500/80 font-mono tracking-widest">
            <Clock className="w-3 h-3 text-green-400 animate-pulse" />
            <span>{time}</span>
        </div>
    );
}

/**
 * BunkerTerminal — Julian's Interface (Technical/Data)
 * V2.5: GHOST DATE EXORCISM
 */
export function BunkerTerminal({ header, lines, glitchLevel = 0 }: BunkerTerminalProps) {
    const headerText = typeof header === "string" && header.trim().length > 0
        ? header
        : "CHECKSUM ERROR // PACKET RECONSTRUCTION ACTIVE";

    const rawLines = Array.isArray(lines) ? lines : [];
    const hasValidLines = rawLines.length > 0;
    const safeLines = hasValidLines ? rawLines : [
        "CHECKSUM ERROR // PACKET RECONSTRUCTION ACTIVE",
        "RETRY SIGNAL INTAKE",
    ];

    const isScanTelemetry = headerText.toLowerCase().includes("telemetry") || headerText.toLowerCase().includes("scanner");
    const displayHeader = isScanTelemetry ? `[SCANNER UPLINK // RAW TELEMETRY] ${headerText}` : headerText;

    // INSTANT DISPLAY - no animation delays
    const [visibleLines, setVisibleLines] = useState<string[]>(safeLines);

    useEffect(() => {
        setVisibleLines(safeLines);
    }, [safeLines]);

    // TASK 1: Deterministic Date Forcing
    // Scans lines for the Ghost Date (24/05/2024) and replaces it with Live Reality.
    const processedLines = useMemo(() => {
        const now = new Date();
        const liveDate = now.toLocaleDateString("en-GB");

        return visibleLines.map(line => {
            // Replace standard ghost date
            let clean = line.replace(/24\/05\/2024/g, liveDate);
            // Replace US format ghost date if it appears
            clean = clean.replace(/05\/24\/2024/g, liveDate);
            // Replace just the year if it looks like a system line
            if (line.includes("CURRENT_DATE")) {
                clean = clean.replace(/2024/g, "2026");
            }
            return clean;
        });
    }, [visibleLines]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "circOut" }}
            className="relative z-50 min-h-[300px] overflow-hidden rounded-sm border-2 border-green-500/70 bg-black font-mono text-sm shadow-[0_0_40px_rgba(16,185,129,0.3)] backdrop-blur-md w-full"
        >
            {/* 1. Header Bar - BRIGHT */}
            <div className="flex items-center justify-between bg-green-900/30 px-4 py-3 border-b-2 border-green-500/50">
                <div className={`text-green-400 font-bold uppercase tracking-widest flex gap-2 items-center text-base ${glitchLevel > 0.5 ? "animate-pulse" : ""}`}>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    {displayHeader}
                </div>
                <LiveClock />
            </div>

            {/* 2. Data Content — ALL LINES VISIBLE IMMEDIATELY */}
            <div className="p-6 space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-transparent">
                {processedLines.map((line, i) => (
                    <div
                        key={i}
                        className="flex gap-4 text-green-200 border-l-2 border-green-500/40 pl-4 text-base leading-loose"
                    >
                        <span className="opacity-50 text-[11px] py-0.5 text-green-400 select-none font-bold min-w-[24px]">
                            {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="leading-relaxed break-words flex-1 text-green-100 font-medium">{line}</span>
                    </div>
                ))}
            </div>

            {/* 3. Glitch Overlay */}
            {glitchLevel > 0 && (
                <motion.div
                    animate={{ opacity: [0, glitchLevel * 0.3, 0] }}
                    transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2 + Math.random() * 3 }}
                    className="absolute inset-0 bg-green-500/10 pointer-events-none"
                />
            )}

            {/* 4. CRT Scanline Effect */}
            <div
                className="absolute inset-0 pointer-events-none z-10 opacity-20"
                style={{
                    background: `
                        linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%),
                        linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))
                    `,
                    backgroundSize: '100% 2px, 3px 100%',
                }}
            />

            {/* 5. Corner Accents - BRIGHT */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-400/50" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-400/50" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-400/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-400/50" />
        </motion.div>
    );
}
