"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

interface IntentHUDProps {
  roomId: string;
}

/**
 * IntentHUD - Mission Status Display
 * V3.1: Sovereign Reactivity + Core Confidence
 * Repositioned to extreme top-left with amber accent.
 */
export function IntentHUD({ roomId }: IntentHUDProps) {
  const roomState = useQuery(api.roomState.getRoomState, { roomId });
  const [confidence, setConfidence] = useState("98.4%");

  // Simulate Neural Fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const val = 97 + Math.random() * 2.9; // 97-99.9%
      setConfidence(val.toFixed(1) + "%");
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const objective =
    typeof roomState?.currentObjective === "string" && roomState.currentObjective.trim().length > 0
      ? roomState.currentObjective
      : "Awaiting objective...";

  const status =
    typeof roomState?.currentStatus === "string" && roomState.currentStatus.trim().length > 0
      ? roomState.currentStatus
      : "SYSTEM: IDLE";

  return (
    <div className="fixed left-4 top-32 z-50 max-w-[200px] rounded-sm border border-amber-900/40 bg-black/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.1)] backdrop-blur-sm">
      <div className="text-[8px] text-amber-500/50 mb-1 flex justify-between">
        <span>MISSION STATUS</span>
        <span className="text-amber-300 opacity-80">{confidence}</span>
      </div>
      <div className="w-full h-[1px] bg-amber-900/50 mb-2" />
      <div className="text-[10px] tracking-[0.1em] text-amber-200/80 normal-case leading-tight">
        {objective}
      </div>
      <div className="mt-1 text-[8px] tracking-[0.15em] text-amber-400/60">
        {status}
      </div>
    </div>
  );
}
