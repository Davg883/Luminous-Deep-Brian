"use client";

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Radio, Lock, Unlock, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SignalReceiverProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SignalReceiver({ isOpen, onClose }: SignalReceiverProps) {
    const signals = useQuery(api.public.signals.listSignals);
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="w-full max-w-2xl bg-stone-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col max-h-[80vh]">

                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-stone-950">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                        <Radio className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-stone-200 font-serif text-lg">Incoming Signals</h2>
                                        <p className="text-stone-500 text-xs font-mono uppercase tracking-widest">Secure Channel Active</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-full text-stone-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-stone-900/50">
                                {signals === undefined ? (
                                    <div className="p-8 text-center text-stone-500 font-mono text-xs animate-pulse">
                                        SCANNING FREQUENCIES...
                                    </div>
                                ) : signals.length === 0 ? (
                                    <div className="p-8 text-center text-stone-500 font-mono text-xs">
                                        NO SIGNALS DETECTED
                                    </div>
                                ) : (
                                    signals.map((signal) => (
                                        <div
                                            key={signal._id}
                                            onClick={() => router.push(`/sanctuary/library/reader/${signal.slug}`)}
                                            className="group flex items-center gap-4 p-4 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all cursor-pointer"
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 bg-black rounded-lg flex items-center justify-center border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                                                <span className="font-mono text-emerald-600 font-bold text-xs group-hover:text-emerald-500">
                                                    {signal.season.toString().padStart(2, '0')}.{signal.episode.toString().padStart(2, '0')}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-stone-300 font-serif text-lg group-hover:text-white transition-colors truncate">
                                                    {signal.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] uppercase tracking-wider font-mono text-stone-600 group-hover:text-stone-500" suppressHydrationWarning>
                                                        {new Date(signal.publishedAt).toLocaleDateString()}
                                                    </span>
                                                    {signal.isLocked && (
                                                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono text-rose-900/80 bg-rose-900/10 px-1.5 py-0.5 rounded border border-rose-900/20">
                                                            <Lock className="w-2 h-2" /> Encrypted
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
                                                    <Play className="w-4 h-4 fill-current" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
