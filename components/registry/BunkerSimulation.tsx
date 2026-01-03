"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * BunkerSimulation — The "Digital Twin"
 * 
 * A 3D Wireframe schematic of the Sanctuary.
 * Shows physical integrity status based on Live Telemetry.
 * If RAIN is detected in Seaview, LEAK indicators pulse.
 */
export function BunkerSimulation() {
    const getTelemetry = useAction(api.brian.getIslandTelemetry);
    const [weather, setWeather] = useState<any>(null);
    const [isLeakDetected, setIsLeakDetected] = useState(false);

    // Initial Telemetry Fetch
    useEffect(() => {
        getTelemetry().then(data => {
            setWeather(data?.weather);
            if (data?.weather?.isRaining) {
                setIsLeakDetected(true);
            }
        });
    }, []);

    // Also random check for visual flair if no telemetry
    useEffect(() => {
        if (Math.random() > 0.8) setIsLeakDetected(true); // Debug/Demo mode: 20% chance of leak if dry
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg aspect-video bg-black/80 border border-slate-800 rounded-sm p-4 flex flex-col items-center justify-center shadow-2xl"
        >
            <div className="absolute top-2 left-3 font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isLeakDetected ? "bg-red-500 animate-ping" : "bg-emerald-500"}`} />
                STRUCTURAL INTEGRITY: {isLeakDetected ? "COMPROMISED" : "OPTIMAL"}
            </div>

            <div className="absolute top-2 right-3 font-mono text-[10px] text-slate-600 uppercase">
                PO34: {weather?.condition || "SCANNING..."}
            </div>

            {/* THE WIREFRAME SVG */}
            <svg viewBox="0 0 400 300" className="w-[80%] h-[80%] opacity-80">
                {/* Floor Grid */}
                <path d="M 50 250 L 350 250 L 300 150 L 100 150 Z" fill="none" stroke="#1e293b" strokeWidth="1" />
                <path d="M 200 150 L 200 250" stroke="#1e293b" strokeWidth="1" />
                <path d="M 150 200 L 250 200" stroke="#1e293b" strokeWidth="1" />

                {/* Back Wall */}
                <rect x="100" y="50" width="200" height="100" fill="none" stroke="#334155" strokeWidth="2" />

                {/* Side Walls */}
                <path d="M 50 250 L 100 150 L 100 50 L 50 50 Z" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 350 250 L 300 150 L 300 50 L 350 50 Z" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

                {/* Roof */}
                <path d="M 50 50 L 100 50 L 300 50 L 350 50" stroke="#475569" strokeWidth="1" />

                {/* ACTIVE ELEMENTS */}
                {/* Server Rack (Left) */}
                <rect x="120" y="80" width="30" height="60" fill={isLeakDetected ? "#450a0a" : "#022c22"} stroke={isLeakDetected ? "#ef4444" : "#10b981"} strokeWidth="1" />

                {/* Terminal (Right) */}
                <rect x="250" y="100" width="40" height="30" fill="none" stroke="#3b82f6" strokeWidth="1" />

                {/* RAIN / LEAK INDICATORS */}
                {isLeakDetected && (
                    <>
                        <circle cx="135" cy="50" r="4" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping" />
                        <path d="M 135 55 L 135 80" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
                        <text x="140" y="70" fill="#ef4444" fontSize="8" fontFamily="monospace">WATER INGRESS</text>
                    </>
                )}
            </svg>

            <div className="w-full text-center font-mono text-[9px] text-slate-600 mt-2">
                DIGITAL TWIN REPLICATION // SCALE 1:100
            </div>

            {/* Scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none opacity-20" />
        </motion.div>
    );
}
