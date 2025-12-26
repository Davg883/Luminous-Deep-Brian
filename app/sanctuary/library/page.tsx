"use client";

import React from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from 'next/link';
import { Play, Info, Lock } from 'lucide-react';
import EpisodeCard from "@/components/library/EpisodeCard";

export default function LibraryPage() {
    const libraryState = useQuery(api.library.getLibraryState);

    if (libraryState === undefined) {
        return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-emerald-900/50 font-mono text-xs animate-pulse">ESTABLISHING UPLINK...</div>;
    }

    const { heroSignal, signals } = libraryState;

    // Filter out hero from the list if desired, or keep it. Netflix usually keeps it in the "list" but highlights it up top.
    // The prompt says "Season Row... displaying the EpisodeCards for the rest of the season."
    // Let's exclude the hero from the row to avoid duplication if it's the "next" one.
    const seasonSignals = signals.filter(s => s._id !== heroSignal?._id);

    return (
        <div className="min-h-screen bg-stone-950 text-stone-300 font-sans selection:bg-emerald-900/30 selection:text-emerald-50 overflow-x-hidden">

            {/* ════════════════════════════════════════════════════
                HERO SECTION (Top 60%)
            ════════════════════════════════════════════════════ */}
            <div className="relative h-[65vh] w-full overflow-hidden">
                {heroSignal ? (
                    <>
                        {/* Hero Background */}
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${heroSignal.coverImage || '/placeholder-hero.jpg'})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/60 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                        </div>

                        {/* Hero Content */}
                        <div className="absolute bottom-0 left-0 w-full p-12 md:p-24 pb-12 z-10 flex flex-col justify-end h-full max-w-4xl">
                            {/* Metadata Pill */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded border border-white/10 text-white font-mono text-xs tracking-widest uppercase">
                                    Season {heroSignal.season} • Episode {heroSignal.episode}
                                </div>
                                {heroSignal.isLocked && (
                                    <div className="px-3 py-1 bg-rose-500/20 backdrop-blur-md rounded border border-rose-500/30 text-rose-300 font-mono text-xs tracking-widest uppercase flex items-center gap-2">
                                        <Lock className="w-3 h-3" /> Encrypted Signal
                                    </div>
                                )}
                            </div>

                            {/* Titles */}
                            <h1 className="text-5xl md:text-7xl font-serif text-white font-bold leading-tight mb-4 drop-shadow-2xl">
                                {heroSignal.title}
                            </h1>
                            <h2 className="text-2xl text-stone-400 font-serif italic mb-6">
                                {heroSignal.subtitle}
                            </h2>

                            {/* Summary */}
                            <p className="text-lg text-stone-300 max-w-2xl mb-8 leading-relaxed drop-shadow-md">
                                {heroSignal.summaryLong || heroSignal.summaryShort || "Signal content description unavailable."}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-6">
                                <Link
                                    href={`/sanctuary/library/reader/${heroSignal.slug}`}
                                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold tracking-widest uppercase text-sm transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    Resume Transmission
                                </Link>
                                <button className="px-8 py-4 bg-stone-800/50 hover:bg-stone-700/50 hover:bg-white/10 border border-white/10 text-white rounded font-bold tracking-widest uppercase text-sm transition-all flex items-center gap-3 backdrop-blur-md">
                                    <Info className="w-5 h-5" />
                                    More Info
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-stone-600 font-mono uppercase tracking-widest">
                        No Signals Detected
                    </div>
                )}
            </div>

            {/* ════════════════════════════════════════════════════
                SEASON ROW (Bottom 40%)
            ════════════════════════════════════════════════════ */}
            <div className="relative z-20 -mt-20 pb-20 pl-12 md:pl-24">
                <h3 className="text-xl text-stone-100 font-serif mb-6 flex items-center gap-4">
                    Season {heroSignal?.season || 0}
                    <span className="h-px flex-1 bg-white/10" />
                </h3>

                <div className="flex gap-6 overflow-x-auto pb-12 pr-12 scrollbar-none snap-x">
                    {seasonSignals.map((signal) => (
                        <div key={signal._id} className="snap-start shrink-0">
                            <EpisodeCard signal={signal} />
                        </div>
                    ))}

                    {/* Placeholder for "Coming Soon" */}
                    <div className="w-64 h-96 shrink-0 bg-stone-900/30 rounded-lg border border-white/5 flex items-center justify-center border-dashed">
                        <span className="font-mono text-xs text-stone-600 uppercase tracking-widest">
                            Awaiting Signal...
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
}
