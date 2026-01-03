# Component Registry (Approved UI)

Brian can only render approved components from the Registry. This protects the Seaview aesthetic.

## Components
- `BunkerTerminal`
  - Props: `{ header?: string, lines?: string[], glitchLevel?: number }`
  - Use: diagnostics, technical readouts, alerts

- `ArtifactCard`
  - Props: `{ title?: string, content?: string, type?: "Myth" | "Signal" | "Reflection" }`
  - Use: lore fragments, narrative discoveries

- `SystemAlert`
  - Props: `{ message: string, severity: "warning" | "critical", showRestoreFeed?: boolean }`
  - Use: interruptions, warnings, errors

- `ImagePanel`
  - Props: `{ title?: string, imageUrl: string, caption?: string }`
  - Use: generated visuals (Nano Banana pipeline)

## Registry Source
- `components/registry/index.tsx`
