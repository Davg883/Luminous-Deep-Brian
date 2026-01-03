# Copilot Architecture V2.0: Client-Side Agentic Runtime

## Overview
This architecture was implemented to resolve persistent stability issues (ZodValidation Errors and Stream Termination Failures) encountered with the `GoogleGenerativeAIAdapter` in the previous V1 backend-centric design.

## Core Change: Client-Side Tool Execution
We have migrated the Agent's capabilities (Tools/Actions) from the Next.js API Route (`app/api/copilotkit/route.ts`) to the React Client (`components/A2UIRenderer.tsx`).

### Why?
- **Backend Adapter Instability**: The server-side adapter for Gemini (v1.5/2.0) struggled with correctly formatting "Tool Call" responses, often returning `undefined` content streams which crashed the Copilot Runtime validation (`ZodError`).
- **LangChain Timeout**: Attempts to wrap the model in LangChain caused stream termination issues ("Run ended without emitting terminal event") due to protocol mismatches.

### The Solution
By defining actions in the Frontend using `useCopilotAction`, we achieve:
1.  **Robustness**: The Browser Runtime handles the tool execution logic, bypassing the server-side adapter's serialization quirks.
2.  **Speed**: Database queries (`lookup_lore`) run directly via the Convex Client in the browser, reducing latency.
3.  **Stability**: The Backend (`route.ts`) is now a simple "Chat Relay" using `gemini-1.5-flash` with no complex tool definitions, ensuring 100% uptime.

## Implementation Details

### Backend (`app/api/copilotkit/route.ts`)
- Configured as a "Dumb Pipe" relay.
- Uses `gemini-1.5-flash` for speed and chat capability.
- `actions: []` (Empty) to prevent adapter interference.
- `instructions`: Contains the **Protocol V2.0** System Mandate.

### Frontend (`components/A2UIRenderer.tsx`)
- Hosts the actual capabilities:
    - **`lookup_lore`**: Fetches data from Convex `artifacts` table.
    - **`update_room_ui`**: Renders React components (`ArtifactCard`, `BunkerTerminal`) to the HUD.
- HUD Position: Moved to **Top-Left** to avoid overlapping the Chat Window.

## Maintenance
- **Adding New Tools**: Define them in `A2UIRenderer.tsx` (or any active Client Component) using `useCopilotAction`. Do not add them to `route.ts`.
- **System Prompts**: Update `BRITISH_PROTOCOL` in `route.ts`.

## Deployment Status
- **Agent**: Online & Stable.
- **Lore**: Seeded via `artifacts:seedSanctuaryLore` (Requires `npm run dev` restart to register).
