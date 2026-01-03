# AI/UI Interface Report

The system implements a controlled, agent-driven UI loop: user intent flows through a Gemini 3 Flash reasoning runtime, invokes curated client-side tools, and renders high-fidelity components via a registry while persisting memory in Convex. This keeps the interface cinematic, stable, and agentic without giving the model raw UI control.

## How It Works (End-to-End)
- User Input: The terminal UI sends user text via CopilotKit (`components/registry/SanctuaryTerminal.tsx`).
- Runtime Relay: `/api/copilotkit` is a dumb relay with a strict system mandate (`app/api/copilotkit/route.ts`).
- Reasoning: Gemini 3 Flash generates text and decides whether to invoke tools.
- Tools (Frontend): Tools execute in the browser via `useCopilotAction` (`components/A2UIRenderer.tsx`).
- UI Rendering: Tool output maps to a pre-approved component in the Registry (`components/registry/index.tsx`).
- Memory: UI state persists per room (`convex/roomState.ts`) and chat persists per user (`convex/messages.ts`).
- Proactive Init: Recent messages seed one UI panel on login (`components/A2UIRenderer.tsx`).

## Why This Is Best Practice
- Controlled Composability: Registry limits UI to approved components, preventing model-generated layout drift (`components/registry/index.tsx`).
- Security by Design: No raw HTML/JS from the model; tools are deterministic, typed, and sandboxed in React.
- Dumb Relay: Backend is a stable pipe with a strict system mandate; tools remain client-side for composability and direct state access (`app/api/copilotkit/route.ts`).
- Defensive Rendering: Terminal guards against undefined states and unsafe iterations (`components/registry/SanctuaryTerminal.tsx`).
- State Separation: UI state persists separately from chat memory to avoid entanglement (`convex/roomState.ts`, `convex/messages.ts`).
- Scalable Memory: Per-user message partitioning avoids global write contention (`convex/schema.ts`).

## What This Enables for Users
- Sovereign Memory: Conversations persist across sessions, so Brian "remembers" previous context (`convex/messages.ts`, `components/registry/SanctuaryTerminal.tsx`).
- Proactive Environment: The room can change based on past interactions without user prompting (`components/A2UIRenderer.tsx`).
- Cinematic Continuity: The Registry ensures visuals stay on-brand and immersive (`docs/Registry_Components.md`).
- Multimodal Loop: Image understanding and generation allow "ask -> see -> remember" cycles (`components/A2UIRenderer.tsx`, `convex/studio/imaging.ts`).

## Operational Guarantees
- Resilience: UI does not crash when the Copilot context is not ready (defensive guards).
- Determinism: Each tool call yields a predictable UI component with validated props.
- Performance: Convex query caching and per-user indexing keep lookups fast.

## Current Documentation Map
- `docs/Architecture_Runtime.md` - runtime flow and system principles
- `docs/Chat_Persistence.md` - sovereign memory design
- `docs/AI_Model_Policy.md` - model tiering and IDs
- `docs/Registry_Components.md` - approved UI building blocks
- `docs/Operations_Runbook.md` - stability and recovery
