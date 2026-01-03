# Runtime Architecture (Current)

## Stack
- Next.js App Router
- CopilotKit runtime (dumb relay)
- Convex (persistence + actions)
- Component Registry (controlled UI composition)

## Data Flow
1. User sends a message in `SanctuaryTerminal`.
2. CopilotKit streams to `/api/copilotkit` (dumb relay).
3. Gemini 3 Flash returns text + tool calls.
4. Frontend tools (useCopilotAction) run in `A2UIRenderer`.
5. UI state persists to Convex `room_state`.
6. Chat messages persist to Convex `messages`.

## Principles
- Controlled composability: agents select from a curated Registry.
- Backend is a relay; all “hands” are client-side actions.
- Convex is the source of memory and spatial persistence.

## Key Files
- `app/api/copilotkit/route.ts` (dumb relay + system mandate)
- `components/A2UIRenderer.tsx` (tool handlers, UI rendering, persistence)
- `components/registry/*` (approved UI components)
- `convex/roomState.ts` + `convex/messages.ts`
