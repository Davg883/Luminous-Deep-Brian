"use client";
import { useState, useEffect, useRef } from "react";
import { ObservationDeck } from "@/components/sanctuary/ObservationDeck";
import { SanctuaryTerminal } from "@/components/registry/SanctuaryTerminal";
import { VisualInput } from "@/components/VisualInput";
import { IntentHUD } from "@/components/sanctuary/IntentHUD";
import { CopilotKitToastKiller } from "@/components/sanctuary/CopilotKitToastKiller";
import { UiCleaner } from "@/components/utility/UiCleaner";
import { BannerKiller } from "@/components/utility/BannerKiller";
import { Monitor, BookOpen, PenTool } from "lucide-react";
import { useCopilotAction, useCopilotReadable, useCopilotChat } from "@copilotkit/react-core";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { A2UIRenderer } from "@/components/A2UIRenderer";
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";

export default function SanctuaryPage() {
    const [activeRoom, setActiveRoom] = useState("control_room");
    const { appendMessage } = useCopilotChat();

    // Telemetry Hooks
    const getTelemetry = useAction(api.brian.getIslandTelemetry);
    const [telemetry, setTelemetry] = useState<any>(null);
    const hasReportedRef = useRef(false);

    // 1. Fetch Telemetry on Mount
    useEffect(() => {
        getTelemetry().then((data) => {
            console.log("[Sanctuary] Telemetry received:", data);
            setTelemetry(data);
        });
    }, []);

    // 2. Proactive Brian Reaction (The "Civic Handshake")
    useEffect(() => {
        if (telemetry && !hasReportedRef.current) {
            hasReportedRef.current = true;

            // We inject a system prompt to force Brian to react to the environment
            appendMessage(new TextMessage({
                role: MessageRole.System,
                content: `[SYSTEM EVENT: SENSOR UPLINK ESTABLISHED]
TELEMETRY DATA (SEAVIEW PO34):
${JSON.stringify(telemetry, null, 2)}

MANDATE:
1. Analyse the weather.
2. If raining, set glitchLevel > 0 via update_room_ui (BunkerTerminal).
3. If network is OPTIMAL, manifest a BunkerTerminal with 'UPLINK: GIGABIT SYMMETRIC'.
4. Speak to the OPR: "Welcome back. It is currently [weather] in Seaview..."`
            }));
        }
    }, [telemetry, appendMessage]);

    // Listen for room changes from Terminal (Protocol Zero)
    useEffect(() => {
        const handleRoomChange = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.roomId) {
                console.log("[SanctuaryPage] Received room change event:", detail.roomId);
                setActiveRoom(detail.roomId);
            }
        };
        window.addEventListener("sanctuary:room-change", handleRoomChange);
        return () => window.removeEventListener("sanctuary:room-change", handleRoomChange);
    }, []);

    // CLIENT-SIDE TOOL: Fetch Ledger (Nuclear Option - Immune to ZodError)
    const recentAllocations = useQuery(api.ledger.getRecentAllocations, { limit: 10 });

    // BRIAN'S PROTOCOL - Tell him when to use the tool
    useCopilotReadable({
        description: "Brian's operational instructions and available tools. Also includes Real-Time Environmental Telemetry.",
        value: {
            currentSystemTime: new Date().toLocaleString("en-GB"),
            instructions: `You are Brian, the Sovereign Core.
STRICT British English.

AVAILABLE TOOLS:
- fetch_ledger: Call this IMMEDIATELY when user asks about "spending", "purchases", "allocations", or "ledger"
- update_room_ui: Use for visual manifestation.

WHEN USER SAYS:
- "Tell me about my spending" → CALL fetch_ledger
- "Show me a visual summary" → CALL update_room_ui with ResourceMonitor
- "Manifest the Resource Monitor" → CALL update_room_ui with ResourceMonitor`,
            telemetry: telemetry
        }
    });

    useCopilotAction({
        name: "fetch_ledger",
        description: "Accesses the Convex Ledger for spending history. Call this when the user asks about past purchases, spending, or allocations.",
        parameters: [
            {
                name: "limit",
                type: "number",
                description: "Number of entries to retrieve (default: 10)"
            }
        ],
        handler: async ({ limit }) => {
            console.log("[Client-Side Tool] fetch_ledger called with limit:", limit);

            if (!recentAllocations || recentAllocations.length === 0) {
                return "The ledger is currently empty. No spending records found in the Seaview archives.";
            }

            // Format the data for Brian
            const formatted = recentAllocations.map((entry: any) =>
                `${entry.merchant}: £${entry.amountGBP.toFixed(2)} [${entry.allocation}] on ${entry.date}`
            ).join(", ");

            return `Found ${recentAllocations.length} ledger entries: ${formatted}`;
        },
    });

    // Helper for manual navigation
    const switchRoom = (room: string) => {
        setActiveRoom(room);
        let label = room.replace("_", " ").toUpperCase();
        window.dispatchEvent(new CustomEvent("sanctuary:chat", {
            detail: {
                role: "user",
                content: `>> OPR: Entering ${label} SECTOR`
            }
        }));
    };

    // Deep Core Handling
    const isDeepCore = activeRoom === "deep_core";

    return (
        <main className={`relative min-h-screen overflow-hidden font-sans text-slate-200 transition-colors duration-1000 ${isDeepCore ? "bg-black" : "bg-black"}`}>

            {/* 1. Dynamic Background */}
            <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${isDeepCore ? "opacity-100" : "opacity-40"}`}>
                <div className={`absolute inset-0 transition-colors duration-1000 ${activeRoom === 'control_room' ? 'bg-emerald-900/20' :
                        activeRoom === 'study' ? 'bg-amber-900/20' :
                            activeRoom === 'workshop' ? 'bg-orange-900/20' :
                                activeRoom === 'deep_core' ? 'bg-black' : // PROTOCOL ZERO: Pure Black
                                    'bg-slate-900/20'
                    }`} />

                {/* Deep Core: Violet Haze */}
                {isDeepCore && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),rgba(0,0,0,1))]" />
                )}

                {!isDeepCore && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black" />
                )}
            </div>

            {/* 2. Top Bar (HUD Container + Title) */}
            <div className={`relative z-10 p-8 transition-opacity duration-1000 ${isDeepCore ? "opacity-20 hover:opacity-100" : "opacity-100"}`}>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="font-serif text-4xl text-slate-200 tracking-wide">The Sanctuary</h1>
                        <p className="font-mono text-xs text-emerald-500 mt-2 tracking-widest uppercase">
                            SECTOR: {activeRoom.replace("_", " ")} // {isDeepCore ? "RESTRICTED" : "ONLINE"}
                        </p>
                    </div>

                    {/* Bio-Auth Status */}
                    <div className="flex items-center gap-3">
                        <SignedOut>
                            <div className="font-mono text-xs text-red-500 tracking-widest uppercase mr-3">
                                NEURAL LINK: OFFLINE
                            </div>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 bg-red-950/50 border border-red-500/50 rounded text-red-400 font-mono text-xs tracking-widest hover:bg-red-900/50 hover:border-red-400 transition-all uppercase">
                                    [ INITIATE NEURAL LINK ]
                                </button>
                            </SignInButton>
                        </SignedOut>

                        <SignedIn>
                            <div className={`font-mono text-xs tracking-widest uppercase mr-3 ${isDeepCore ? "text-violet-500" : "text-emerald-500"}`}>
                                NEURAL LINK: {isDeepCore ? "OVERRIDDEN" : "STABLE"}
                            </div>
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: `w-8 h-8 border-2 ${isDeepCore ? "border-violet-500/50" : "border-emerald-500/50"}`
                                    }
                                }}
                            />
                        </SignedIn>
                    </div>
                </div>
            </div>

            <IntentHUD roomId={activeRoom} />
            <CopilotKitToastKiller />
            <UiCleaner />
            <BannerKiller />

            {/* 3. The Brain Display (Visual Cortex) */}
            {/* LAYOUT FIX: Added padding to avoid overlapping HUD (left) and Terminal (right) */}
            <div className="relative z-0 min-h-[650px] flex items-center justify-center pl-[240px] pr-[440px]">
                <ObservationDeck>
                    <A2UIRenderer roomId={activeRoom} onChangeRoom={setActiveRoom} />
                </ObservationDeck>
            </div>

            {/* 4. The Terminal (Fixed Right) */}
            <div className="fixed right-8 top-24 bottom-8 w-[400px] z-40">
                <SanctuaryTerminal />
            </div>

            {/* 5. Sovereign Controls (Bottom Left) */}
            <div className={`fixed bottom-8 left-8 z-50 flex gap-4 transition-opacity duration-1000 ${isDeepCore ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <button
                    onClick={() => switchRoom("control_room")}
                    className={`p-3 border rounded-full transition-all ${activeRoom === "control_room" ? "bg-emerald-900/50 border-emerald-500 text-emerald-200" : "bg-slate-900/80 border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400"}`}
                    title="Control Room"
                >
                    <Monitor className="w-5 h-5" />
                </button>
                <button
                    onClick={() => switchRoom("study")}
                    className={`p-3 border rounded-full transition-all ${activeRoom === "study" ? "bg-amber-900/50 border-amber-500 text-amber-200" : "bg-slate-900/80 border-slate-700 text-slate-400 hover:border-amber-500 hover:text-amber-400"}`}
                    title="The Study"
                >
                    <BookOpen className="w-5 h-5" />
                </button>
                <button
                    onClick={() => switchRoom("workshop")}
                    className={`p-3 border rounded-full transition-all ${activeRoom === "workshop" ? "bg-orange-900/50 border-orange-500 text-orange-200" : "bg-slate-900/80 border-slate-700 text-slate-400 hover:border-orange-500 hover:text-orange-400"}`}
                    title="Workshop"
                >
                    <PenTool className="w-5 h-5" />
                </button>
            </div>

            {/* 5.5. MANUAL LEDGER ACCESS */}
            {recentAllocations && recentAllocations.length > 0 && !isDeepCore && (
                <div className="fixed bottom-8 right-[440px] z-50">
                    <div className="bg-emerald-950/90 border border-emerald-500/50 rounded p-3 text-xs">
                        <div className="font-mono text-emerald-400 mb-2">LEDGER: {recentAllocations.length} ENTRIES</div>
                        <div className="text-emerald-200/70 space-y-1">
                            {recentAllocations.slice(0, 3).map((entry: any, i: number) => (
                                <div key={i}>£{entry.amountGBP.toFixed(2)} - {entry.merchant}</div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 6. The Eye */}
            <VisualInput roomId={activeRoom} onChangeRoom={setActiveRoom} />

        </main>
    );
}
