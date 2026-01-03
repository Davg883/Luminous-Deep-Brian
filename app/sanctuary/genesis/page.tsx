"use client";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Genesis() {
    const [text, setText] = useState("");
    const [tier, setTier] = useState("free");
    const [status, setStatus] = useState("IDLE");

    // We'll use a try/catch block because api.genesis might not be generated yet if the previous dev build failed
    // but this code is valid once the backend is fixed.
    const ingestRawContent = useAction(api.genesis.ingestRawContent);

    const handleIngest = async () => {
        if (!text.trim()) return;
        setStatus("PROCESSING...");
        try {
            const result = await ingestRawContent({ rawText: text, tier });

            if (result.status === "error") {
                setStatus(`ERROR: ${result.message}`);
                console.error("Ingest failed:", result.message);
            } else {
                setStatus(`SUCCESS - INGESTED: ${result.title}`);
                setText("");
            }
        } catch (e) {
            setStatus("ERROR - SEE CONSOLE");
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-12 relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10">
                <h1 className="text-3xl mb-2 tracking-widest uppercase text-green-400">Genesis Protocol</h1>
                <div className="h-px w-full bg-green-900 mb-8" />

                <div className="grid grid-cols-3 gap-8 mb-8">
                    <div className="col-span-2">
                        <label className="block text-xs text-green-700 mb-2 uppercase tracking-widest">
                            Raw Manuscript Input
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-96 bg-black/50 border border-green-900/50 p-4 focus:outline-none focus:border-green-500 text-sm font-mono text-green-300 placeholder-green-900 transition-colors resize-none"
                            placeholder="Paste raw content here... narrative logs, signal transcipts, or myth fragments."
                        />
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs text-green-700 mb-2 uppercase tracking-widest">
                                Classification Tier
                            </label>
                            <select
                                value={tier}
                                onChange={(e) => setTier(e.target.value)}
                                className="w-full bg-black border border-green-900/50 p-2 text-green-400 focus:border-green-500 outline-none"
                            >
                                <option value="free">Clearance: Free</option>
                                <option value="patron">Clearance: Patron</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-green-700 mb-2 uppercase tracking-widest">
                                Protocol Status
                            </label>
                            <div className={`text-xs border p-3 ${status.includes("SUCCESS") ? "border-green-500 text-green-400 bg-green-900/20" :
                                status.includes("ERROR") ? "border-red-900 text-red-500 bg-red-900/10" :
                                    "border-green-900/30 text-green-700"
                                }`}>
                                {status.includes("PROCESSING") && <span className="animate-pulse">▶ </span>}
                                {status}
                            </div>
                        </div>

                        <button
                            onClick={handleIngest}
                            disabled={status === "PROCESSING..." || !text}
                            className={`w-full py-4 mt-4 border transition-all uppercase tracking-widest text-xs font-bold
                                ${!text ? "border-green-900/30 text-green-900 cursor-not-allowed" :
                                    "border-green-500 text-green-400 hover:bg-green-500 hover:text-black cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.2)]"}
                            `}
                        >
                            Initiate Ingest
                        </button>
                    </div>
                </div>

                <div className="text-[10px] text-green-900 uppercase tracking-[0.2em] text-center mt-20">
                    Sovereign Core // Content Injection System
                </div>
            </div>

            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
                style={{ backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
        </div>
    );
}
