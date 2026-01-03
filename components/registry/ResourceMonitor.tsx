"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface ResourceData {
    label: string;
    value: number; // Percentage 0-100 or raw value
    color: string;
}

interface ResourceMonitorProps {
    title?: string;
    data?: ResourceData[];
    totalSpend?: number;
}

/**
 * ResourceMonitor - Visualizing the Ledger
 * A tactical ring chart for financial/resource allocation.
 */
export function ResourceMonitor({
    title = "RESOURCE ALLOCATION",
    data = [
        { label: "PROVISIONS", value: 45, color: "#10B981" }, // Emerald
        { label: "HARDWARE", value: 30, color: "#F59E0B" },  // Amber
        { label: "OPERATIONS", value: 25, color: "#3B82F6" }, // Blue
    ],
    totalSpend = 1243.50
}: ResourceMonitorProps) {

    // Calculate stroke dasharrays for the rings
    const radius = 80;
    const circumference = 2 * Math.PI * radius;

    // Memoize the segments to stack them
    const segments = useMemo(() => {
        let accumulated = 0;
        return data.map((item) => {
            const offset = (accumulated / 100) * circumference;
            accumulated += item.value;
            return {
                ...item,
                offset: -offset, // Negative to rotate clockwise
                dash: (item.value / 100) * circumference
            };
        });
    }, [data, circumference]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-md bg-black/90 border border-slate-800 rounded-sm p-6 flex flex-col items-center shadow-2xl backdrop-blur-xl"
        >
            {/* Header */}
            <div className="w-full flex justify-between items-center border-b border-slate-800 pb-3 mb-6">
                <h3 className="font-mono text-xs text-emerald-500 tracking-[0.2em] uppercase">{title}</h3>
                <span className="font-mono text-[10px] text-slate-500">NET.V1.5</span>
            </div>

            {/* The Radar / Ring Chart */}
            <div className="relative w-64 h-64 mb-6">
                {/* Background Grid */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="80" fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
                    <circle cx="50%" cy="50%" r="60" fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.3" />
                    <circle cx="50%" cy="50%" r="40" fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.2" />

                    {/* Data Rings */}
                    {segments.map((seg, i) => (
                        <motion.circle
                            key={i}
                            initial={{ strokeDasharray: `0 ${circumference}` }}
                            animate={{ strokeDasharray: `${seg.dash} ${circumference}` }}
                            transition={{ duration: 1, delay: i * 0.2, ease: "circOut" }}
                            cx="50%"
                            cy="50%"
                            r="80"
                            fill="none"
                            stroke={seg.color}
                            strokeWidth="12"
                            strokeDashoffset={seg.offset}
                            strokeLinecap="butt"
                            className="opacity-80"
                        />
                    ))}
                </svg>

                {/* Center Readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total</span>
                    <span className="text-2xl font-mono text-slate-200 font-bold">
                        £{totalSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                </div>

                {/* Scanning Radar Sweep Effect */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-full h-full rounded-full border-t border-emerald-500/30 bg-gradient-to-tr from-emerald-500/10 to-transparent pointer-events-none"
                />
            </div>

            {/* Legend */}
            <div className="w-full grid grid-cols-2 gap-4">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.label}</span>
                            <span className="text-xs font-mono text-slate-200">{item.value}%</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-emerald-500/50" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-emerald-500/50" />
        </motion.div>
    );
}
