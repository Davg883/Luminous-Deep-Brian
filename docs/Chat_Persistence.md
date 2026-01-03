# Chat Persistence (Sovereign Memory)

## Purpose
Persist user conversations across sessions so Brian retains context.

## Storage
- Table: `messages`
- Keys: `userId`, `createdAt`
- De-dupe: `sourceId` (CopilotKit message id)

## API
- Query: `api.messages.getMessages({ limit })`
- Query: `api.messages.getRecentMessages({ limit })`
- Mutation: `api.messages.saveMessage({ role, content, sourceId? })`

## Client Flow
1. Load history from Convex.
2. Seed CopilotKit state via `appendMessage`.
3. Persist new visible messages in real time.

## Notes
- Guests are skipped (no identity).
- Limit defaults: 200 for full history, 5 for proactive init.
