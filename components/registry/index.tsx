"use client";

import { BunkerTerminal } from "./BunkerTerminal";
import { ArtifactCard } from "./ArtifactCard";
import { SystemAlert } from "./SystemAlert";
import { ImagePanel } from "./ImagePanel";
import { BunkerLedger } from "./BunkerLedger";
import { CortexArtifact } from "./CortexArtifact";
import { ChoiceCard } from "./ChoiceCard";
import { ResourceMonitor } from "./ResourceMonitor";
import { BunkerSimulation } from "./BunkerSimulation";

// Re-export components for direct imports
export { BunkerTerminal } from "./BunkerTerminal";
export { ArtifactCard } from "./ArtifactCard";
export { SystemAlert } from "./SystemAlert";
export { ImagePanel } from "./ImagePanel";
export { BunkerLedger } from "./BunkerLedger";
export { CortexArtifact } from "./CortexArtifact";
export { ChoiceCard } from "./ChoiceCard";
export { ResourceMonitor } from "./ResourceMonitor";
export { BunkerSimulation } from "./BunkerSimulation";

/**
 * ComponentRegistry — The Map the AI uses to "Draw" the UI
 * 
 * Brian (the Sovereign Core) outputs A2UI JSON payloads containing
 * component names as string IDs. This registry resolves those IDs
 * to actual React components for rendering.
 * 
 * Seaview Aesthetic: All components adhere to the British-coastal
 * design language — overcast tones, salt-spray textures, and
 * precision engineering from Julian's code-first philosophy.
 */
export const ComponentRegistry: Record<string, React.FC<any>> = {
    "BunkerTerminal": BunkerTerminal,
    "ArtifactCard": ArtifactCard,
    "SystemAlert": SystemAlert,
    "ImagePanel": ImagePanel,
    "BunkerLedger": BunkerLedger,
    "CortexArtifact": CortexArtifact,
    "ChoiceCard": ChoiceCard,
    "ResourceMonitor": ResourceMonitor,
    "BunkerSimulation": BunkerSimulation,
};

// Type-safe component ID union
export type A2UIComponentId = keyof typeof ComponentRegistry;
