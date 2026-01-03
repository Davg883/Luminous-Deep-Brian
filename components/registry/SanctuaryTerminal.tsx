"use client";
import { useCopilotChat } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import { useEffect, useRef, useState } from "react";
import { Send, Cpu, Terminal, Share } from "lucide-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BrianAvatar } from "@/components/registry/BrianAvatar";
import { useUser } from "@clerk/nextjs";

type LocalMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

type A2UIPayload = {
    component?: string;
    props?: Record<string, unknown>;
};

export function SanctuaryTerminal() {
    const { user, isLoaded } = useUser();
    const { visibleMessages, appendMessage, isLoading, runChatCompletion, isAvailable } = useCopilotChat();

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState("");

    // Sovereign Memory (Convex)
    const persistedMessages = useQuery(api.messages.getMessages, { limit: 50 });
    const saveMessage = useMutation(api.messages.saveMessage);
    const brianChat = useAction(api.brian.chat);
    const persistRoomUpdate = useMutation(api.roomState.persistRoomUpdate);
    const logSpend = useMutation(api.ledger.logSpend);
    const recentAllocations = useQuery(api.ledger.getRecentAllocations, { limit: 10 });

    // State Tracking
    const seededRef = useRef(false);
    const savedIds = useRef<Set<string>>(new Set());
    const memoryPulseActive = Boolean(persistedMessages && persistedMessages.length > 0);
    const [sendError, setSendError] = useState<string | null>(null);
    const [isabellaPulse, setIsabellaPulse] = useState(false);
    const isabellaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
    // Defensive: Ensure we always have an array
    const safeMessages = visibleMessages || [];
    const displayMessages = safeMessages.length > 0 ? safeMessages : localMessages;

    // PATRON RITUAL HOOK (The Welcome)
    useEffect(() => {
        // Only run if user is authenticated and hasn't seen the ritual locally
        // Hardcoded simulation for demo
        const isPatronSimulated = true;
        const ritualKey = "sanctuary_patron_ritual_v1";

        if (user && isPatronSimulated && !sessionStorage.getItem(ritualKey)) {
            sessionStorage.setItem(ritualKey, "completed");

            setTimeout(() => {
                // 1. Audio/Visual Glitch
                window.dispatchEvent(new CustomEvent("sanctuary:glitch", { detail: { level: 0.8 } }));

                // 2. Julian Greeting (Fake message injection)
                const msgId = `sys-${Date.now()}`;

                // We add it to local state to appear immediately
                setLocalMessages(prev => [...prev, {
                    id: msgId,
                    role: "assistant", // Julian/System voice
                    content: ">> IDENTITY VERIFIED: PATRON CLASS DETECTED.\n>> PRIORITY BANDWIDTH ALLOCATED.\n>> WELCOME TO THE DEEP, PATRON."
                }]);

                // 3. Brian Avatar Projection
                window.dispatchEvent(new CustomEvent("sanctuary:projection", {
                    detail: {
                        component: "ImagePanel",
                        props: {
                            src: "https://res.cloudinary.com/dptqxjhb8/image/upload/v1764350000/brian_avatar_hologram.png",
                            caption: "SOVEREIGN CORE: ONLINE",
                            variant: "holographic"
                        }
                    }
                }));

            }, 1500);
        }
    }, [user]);

    // BROADCAST FEATURE (Build in Public)
    const handleShare = () => {
        // 1. Notify User
        const msgId = `sys-${Date.now()}`;
        setLocalMessages(prev => [...prev, {
            id: msgId, role: "assistant", content: ">> PACKAGING SNAPSHOT FOR MAINLAND REQUEST..."
        }]);

        // 2. Simulate Delay & Action
        setTimeout(() => {
            // In real app, this calls api/telemetry/snapshot
            // For now, we simulate success
            if (navigator.clipboard) {
                navigator.clipboard.writeText("https://luminousDeep.io/dispatch/884-XJ-9");
                alert("SOVEREIGN DISPATCH LINK COPIED:\nhttps://luminousDeep.io/dispatch/884-XJ-9");
            }
        }, 1200);
    };

    const applyDossierProjection = (text: string) => {
        const lower = text.toLowerCase();
        const mentions = [
            { id: "julian", idx: lower.indexOf("julian") },
            { id: "eleanor", idx: lower.indexOf("eleanor") },
            { id: "cassie", idx: lower.indexOf("cassie") },
        ].filter((m) => m.idx !== -1);

        if (!mentions.length) return;
        mentions.sort((a, b) => a.idx - b.idx);
        const target = mentions[0].id;

        if (target === "julian") {
            const props = {
                header: "SOVEREIGN DOSSIER: JULIAN CROFT",
                lines: [
                    "ROLE: STRATEGIST / BOATHOUSE",
                    "MANDATE: TECHNICAL TRUTH",
                    "TONE: PRECISE, RESTRAINED",
                    "KEYWORDS: VECTORS, SALINITY, RESILIENCE",
                ],
            };
            window.dispatchEvent(new CustomEvent("sanctuary:projection", { detail: { component: "BunkerTerminal", props } }));
            void persistRoomUpdate({ roomId: "control_room", component: "BunkerTerminal", props: JSON.stringify(props) });
            return;
        }
        // ... omitted other dossier logic for brevity in this update, assuming it's preserved if I copied correctly ...
        // Re-injecting full logic below to be safe
        if (target === "eleanor") {
            const props = {
                title: "SOVEREIGN DOSSIER: ELEANOR VANCE",
                content: [
                    "Mandate: Meaning-making, archival continuity, and human memory.",
                    "Tone: Poetic, calm, reflective. Witness to the Solent.",
                ].join(" "),
                type: "Reflection",
            };
            window.dispatchEvent(new CustomEvent("sanctuary:projection", { detail: { component: "ArtifactCard", props } }));
            void persistRoomUpdate({ roomId: "control_room", component: "ArtifactCard", props: JSON.stringify(props) });
            return;
        }

        if (target === "cassie") {
            const props = {
                title: "SOVEREIGN DOSSIER: CASSIE MONROE",
                content: [
                    "Mandate: Prototyping, augmentation, and controlled experimentation.",
                    "Tone: Energetic, inventive, optimistic.",
                ].join(" "),
                type: "Signal",
            };
            window.dispatchEvent(new CustomEvent("sanctuary:projection", { detail: { component: "ArtifactCard", props } }));
            void persistRoomUpdate({ roomId: "control_room", component: "ArtifactCard", props: JSON.stringify(props) });
        }
    };

    const extractA2UIPayload = (raw: string): { cleaned: string; payload?: A2UIPayload } => {
        const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
        const jsonCandidate = fenced ? fenced[1] : raw.match(/\{[\s\S]*\}/)?.[0];
        let payload: A2UIPayload | undefined;
        if (jsonCandidate) {
            try {
                payload = JSON.parse(jsonCandidate) as A2UIPayload;
            } catch {
                payload = undefined;
            }
        }
        const cleaned = raw
            .replace(/```json[\s\S]*?```/gi, "")
            .replace(/\{[\s\S]*\}/, "")
            .trim();
        return { cleaned: cleaned || "Acknowledged. Updating display.", payload };
    };

    const extractSpend = (text: string) => {
        const match = text.match(/(?:\u00A3|gbp)\s?([0-9]+(?:\.[0-9]{1,2})?)/i);
        if (!match) return null;
        const amount = Number(match[1]);
        if (Number.isNaN(amount)) return null;
        const allocationMatch = text.match(/to\s+([a-z0-9\s-]+?)(?:[.?!]|$)/i);
        const allocation = allocationMatch ? allocationMatch[1].trim() : "General Allocation";
        return { amount, allocation };
    };
    const projectLedger = async (amount: number, allocation: string) => {
        const ledgerProps = {
            date: new Date().toLocaleDateString("en-GB"),
            amountGBP: amount,
            allocation,
            verifiedBy: "Julian",
        };

        const result = await logSpend({
            date: ledgerProps.date,
            amountGBP: ledgerProps.amountGBP,
            allocation: ledgerProps.allocation,
            verifiedBy: ledgerProps.verifiedBy,
        });

        const ledgerPayload = { ...ledgerProps, entryId: result.id };

        window.dispatchEvent(
            new CustomEvent("sanctuary:projection", {
                detail: { component: "BunkerLedger", props: ledgerPayload },
            })
        );
        await persistRoomUpdate({
            roomId: "control_room",
            component: "BunkerLedger",
            props: JSON.stringify(ledgerPayload),
        });
    };

    // 1. Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [displayMessages, isLoading]);

    // 2. Load Knowledge (Seeding)
    useEffect(() => {
        if (seededRef.current || !persistedMessages || !appendMessage) return;

        const seed = async () => {
            seededRef.current = true;
            // Seed logic here if needed
        };
        seed();
    }, [persistedMessages, appendMessage]);

    useEffect(() => {
        const handleSanctuaryChat = (event: Event) => {
            const detail = (event as CustomEvent).detail as { role?: string; content?: string } | undefined;
            if (!detail?.content) return;
            const role = (detail.role as "user" | "assistant") || "assistant";
            const replyId = `${Date.now()}-${Math.random()}`;
            setLocalMessages((prev) => [
                ...prev,
                { id: replyId, role, content: detail.content },
            ]);
            void saveMessage({
                role,
                content: detail.content,
                sourceId: replyId,
            });
        };

        window.addEventListener("sanctuary:chat", handleSanctuaryChat);
        return () => {
            window.removeEventListener("sanctuary:chat", handleSanctuaryChat);
        };
    }, [saveMessage]);

    // 3. Save New Memories (Persistence)
    useEffect(() => {
        if (!safeMessages.length) return;

        const persist = async () => {
            for (const msg of safeMessages) {
                if (!msg.content) continue;
                const msgId = msg.id || `${Date.now()}-${Math.random()}`;
                if (!savedIds.current.has(msgId)) {
                    savedIds.current.add(msgId);
                    try {
                        await saveMessage({
                            role: msg.role === "user" ? "user" : "assistant",
                            content: msg.content.toString(),
                            sourceId: msgId,
                        });
                    } catch (e) {
                        console.warn("Memory Save Failed", e);
                    }
                }
            }
        };
        persist();
    }, [safeMessages, saveMessage]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const content = inputValue;
        setInputValue(""); // Clear UI immediately

        // SECRET ROOM INTERCEPT: Protocol Zero
        if (content.toUpperCase().includes("INITIATE PROTOCOL ZERO")) {
            const msgId = `${Date.now()}-${Math.random()}`;
            setLocalMessages((prev) => [...prev, { id: msgId, role: "user", content }]);
            void saveMessage({ role: "user", content, sourceId: msgId });

            setTimeout(() => {
                window.dispatchEvent(
                    new CustomEvent("sanctuary:chat", {
                        detail: {
                            role: "assistant",
                            content: ">> WARNING: SEAVIEW SAFETY PROTOCOLS OVERRIDDEN.\n>> INITIATING DEEP CORE SEQUENCE...",
                        },
                    })
                );
            }, 800);

            setTimeout(() => {
                window.dispatchEvent(
                    new CustomEvent("sanctuary:projection", {
                        detail: {
                            component: "ArtifactCard", props: {
                                type: "Myth",
                                title: "PROTOCOL ZERO: ISABELLA",
                                content: "She is the ghost in the machine. Requires clearance Level 0.",
                                image: "https://res.cloudinary.com/dptqxjhb8/image/upload/v1764350000/isabella_card_glow.png"
                            }
                        },
                    })
                );
                window.dispatchEvent(new CustomEvent("sanctuary:room-change", { detail: { roomId: "deep_core" } }));
            }, 2500);
            return;
        }

        // LEDGER COMMAND INTERCEPT
        if (/ledger|purchases|spending/i.test(content)) {
            const localId = `${Date.now()}-${Math.random()}`;
            setLocalMessages((prev) => [
                ...prev,
                { id: localId, role: "user", content },
            ]);

            const replyId = `${Date.now()}-${Math.random()}`;

            if (recentAllocations && recentAllocations.length > 0) {
                const lines = [
                    `PROVISIONING HISTORY: ${recentAllocations.length} ENTRIES RECOVERED`,
                    "",
                    ...recentAllocations.map((e: any) =>
                        `£${e.amountGBP.toFixed(2)} | ${e.merchant} | ${e.allocation}`
                    ),
                    "",
                    "LEDGER INTEGRITY: VERIFIED"
                ];

                window.dispatchEvent(
                    new CustomEvent("sanctuary:projection", {
                        detail: {
                            component: "BunkerTerminal",
                            props: { header: "SEAVIEW LEDGER ARCHIVES", lines }
                        }
                    })
                );
                await persistRoomUpdate({
                    roomId: "control_room",
                    component: "BunkerTerminal",
                    props: JSON.stringify({ header: "SEAVIEW LEDGER ARCHIVES", lines })
                });

                const ledgerResponse = `LEDGER ACCESS GRANTED. ${recentAllocations.length} entries manifested on wall.`;
                setLocalMessages((prev) => [
                    ...prev,
                    { id: replyId, role: "assistant", content: ledgerResponse },
                ]);
                await saveMessage({ role: "user", content, sourceId: localId });
                await saveMessage({ role: "assistant", content: ledgerResponse, sourceId: replyId });
            } else {
                const ledgerResponse = "LEDGER ACCESS GRANTED. No entries found in database. Upload a receipt to begin tracking.";
                setLocalMessages((prev) => [
                    ...prev,
                    { id: replyId, role: "assistant", content: ledgerResponse },
                ]);
                await saveMessage({ role: "user", content, sourceId: localId });
                await saveMessage({ role: "assistant", content: ledgerResponse, sourceId: replyId });
            }
            return;
        }

        const userPayload = extractA2UIPayload(content);
        const userDisplay = userPayload.cleaned || "UI PAYLOAD SUBMITTED";

        if (/isabella/i.test(content)) {
            setIsabellaPulse(true);
            if (isabellaTimerRef.current) {
                clearTimeout(isabellaTimerRef.current);
            }
            isabellaTimerRef.current = setTimeout(() => {
                setIsabellaPulse(false);
            }, 4000);
        }

        try {
            setSendError(null);
            const localId = `${Date.now()}-${Math.random()}`;
            setLocalMessages((prev) => [
                ...prev,
                { id: localId, role: "user", content: userDisplay },
            ]);

            if (userPayload.payload?.component && userPayload.payload.props) {
                window.dispatchEvent(
                    new CustomEvent("sanctuary:projection", {
                        detail: { component: userPayload.payload.component, props: userPayload.payload.props },
                    })
                );
                void persistRoomUpdate({
                    roomId: "control_room",
                    component: userPayload.payload.component,
                    props: JSON.stringify(userPayload.payload.props),
                });
            }

            let assistantRendered = false;
            await appendMessage(
                new TextMessage({
                    role: MessageRole.User,
                    content: content,
                })
            );

            if (runChatCompletion) {
                const completion = await runChatCompletion();
                const last = Array.isArray(completion) ? completion[completion.length - 1] : null;
                if (last && (last as any).role === "assistant") {
                    const replyId = (last as any).id || `${Date.now()}-${Math.random()}`;
                    const replyContent = String((last as any).content || "[NO RESPONSE]");
                    const { cleaned, payload } = extractA2UIPayload(replyContent);
                    setLocalMessages((prev) => [
                        ...prev,
                        { id: replyId, role: "assistant", content: cleaned },
                    ]);
                    assistantRendered = true;
                    if (payload?.component && payload.props) {
                        window.dispatchEvent(
                            new CustomEvent("sanctuary:projection", {
                                detail: { component: payload.component, props: payload.props },
                            })
                        );
                        void persistRoomUpdate({
                            roomId: "control_room",
                            component: payload.component,
                            props: JSON.stringify(payload.props),
                        });
                    }
                    const spend = extractSpend(content);
                    if (spend) {
                        await projectLedger(spend.amount, spend.allocation);
                    }
                }
            }

            if (!assistantRendered) {
                const fallbackReply = await brianChat({ prompt: content });
                const { cleaned, payload } = extractA2UIPayload(String(fallbackReply));
                const replyId = `${Date.now()}-${Math.random()}`;
                setLocalMessages((prev) => [
                    ...prev,
                    { id: replyId, role: "assistant", content: cleaned },
                ]);
                if (payload?.component && payload.props) {
                    window.dispatchEvent(
                        new CustomEvent("sanctuary:projection", {
                            detail: { component: payload.component, props: payload.props },
                        })
                    );
                    void persistRoomUpdate({
                        roomId: "control_room",
                        component: payload.component,
                        props: JSON.stringify(payload.props),
                    });
                }
                const spend = extractSpend(content);
                if (spend) {
                    await projectLedger(spend.amount, spend.allocation);
                }
            }

        } catch (error) {
            console.error("Transmission failed:", error);
            setSendError("UPLINK ERROR. RETRY.");
        }
    };

    return (
        <div className="relative w-full h-[600px] bg-black/90 backdrop-blur-xl border border-slate-800 rounded-sm shadow-2xl flex flex-col font-mono text-xs overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-slate-800">
                <div className="flex items-center gap-3 text-emerald-500/80 tracking-widest uppercase">
                    <BrianAvatar isActive={isLoading} isIsabella={isabellaPulse} />
                    <div className={`w-2 h-2 rounded-full ${isLoading ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                    SANCTUARY OS V2.6 // UPLINK: ACTIVE
                </div>
                {/* SHARE BUTTON */}
                <div className="flex items-center gap-4 text-slate-600">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-emerald-400 transition-colors uppercase tracking-widest border border-slate-800 px-2 py-1 rounded-sm bg-black hover:bg-slate-900"
                        title="SHARE TO MAINLAND"
                    >
                        <Share className="w-3 h-3" />
                        SHARE
                    </button>
                    <div className={`w-2 h-2 rounded-full transition-all duration-1000 ${memoryPulseActive ? "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-slate-800"}`} />
                    <Cpu className="w-4 h-4" />
                </div>
            </div>

            {/* Log Output */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">

                {/* Boot Message */}
                <div className="flex flex-col gap-1 items-start opacity-50">
                    <span className="text-[10px] uppercase tracking-widest mb-1">{'>>'} SYS [BOOT SEQUENCE]</span>
                    <div className="max-w-[90%] p-3 rounded-sm border bg-slate-900/30 border-slate-800 text-slate-400">
                        Secure Connection Established. Sovereign Core Brian is listening.
                        <div className="mt-2 text-[10px] opacity-70">
                            {'>>'} SOVEREIGN ARCHITECTURE V2.7 // SEALED.<br />
                            {'>>'} MEMORY UPLINK: STABLE.<br />
                            {'>>'} BRAIN: Gem-3-Flash-Preview // ONLINE.
                        </div>
                    </div>
                </div>

                {/* Historic (Persisted) Messages - Rendered Read-Only */}
                {persistedMessages?.map((m, i) => (
                    <div key={`hist-${i}`} className={`flex flex-col gap-1 opacity-60 ${m.role === "user" ? "items-end" : "items-start"}`}>
                        <span className="text-[10px] uppercase tracking-widest mb-1">
                            {m.role === "user" ? <>{'>>'} MEM [USER]</> : <>{'>>'} MEM [CORE]</>}
                        </span>
                        <div className={`max-w-[90%] p-3 rounded-sm border border-slate-800 ${m.role === "user" ? "text-cyan-200/70" : "text-emerald-200/70"}`}>
                            {m.content}
                        </div>
                    </div>
                ))}

                {/* Live Session Messages */}
                {displayMessages.map((m, i) => (
                    <div key={`live-${i}`} className={`flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}>
                        <span className="text-[10px] opacity-30 uppercase tracking-widest mb-1">
                            {m.role === "user" ? <>{'>>'} OPR [CHANNEL: SOVEREIGN]</> : <>{'>>'} BRN [CORE INTELLIGENCE]</>}
                        </span>
                        <div className={`max-w-[90%] p-3 rounded-sm border ${m.role === "user"
                            ? "bg-cyan-950/30 border-cyan-900/50 text-cyan-200"
                            : "bg-emerald-950/30 border-emerald-900/50 text-emerald-200"
                            }`}>
                            {/* Render text or loading state */}
                            {m.content || <span className="italic opacity-50 animate-pulse">[PROCESSING...]</span>}
                        </div>
                    </div>
                ))}

                {!isAvailable && (
                    <div className="text-amber-400 text-[10px] uppercase tracking-widest opacity-60">
                        {'>>'} UPLINK NOT READY
                    </div>
                )}

                {sendError && (
                    <div className="text-red-500 font-bold border border-red-900 p-2">
                        {'>>'} {sendError}
                    </div>
                )}
            </div>

            {/* Input Field */}
            <div className="p-4 bg-black border-t border-slate-800">
                <div className="flex items-center gap-2 bg-slate-900/30 border border-slate-800 p-2 rounded-sm focus-within:border-emerald-500/50 transition-colors">
                    <span className="text-emerald-500 font-bold px-2">{'>>'}</span>
                    <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-600 h-8"
                        placeholder={!user ? "BIO-AUTH REQUIRED...." : "ENTER_COMMAND..."}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isLoading || !user}
                    />
                    <button onClick={handleSend} disabled={isLoading || !user} className="text-slate-500 hover:text-emerald-400 transition-colors px-2 disabled:opacity-50">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
        </div>
    );
}
