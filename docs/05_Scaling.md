# Scaling & Cost Efficiency (Operational Reference)

This note captures the cost and scaling guidance for The Luminous Deep, with a focus on efficient routes as the house fills.

## Scaling Characteristics
- Convex scales with near-linear efficiency; no manual shard management.
- Per-user data (messages, room state) scales cleanly via `userId` partitioning.
- Primary contention risk is a single hot document updated by many users at once; avoid global write hotspots.

## Cost Drivers (Priority Order)
1. LLM API calls (Gemini) for reasoning and generation.
2. Media bandwidth (Cloudinary), especially 4K loops.
3. Storage (Convex DB + vectors) is comparatively low-cost.

## Efficiency Tactics
### Ephemeral Ingest (Data Shredding)
- Extract a short insight (e.g., "User prefers premium coffee") and discard raw data.
- Store only the distilled insight in `messages`.

### Model Tiering (Flash vs Pro)
- Default to `gemini-3-flash-preview` for chat, summarisation, and analysis.
- Use Pro image generation only for paid "Deep Dive" or premium outputs.

### Vector Caching
- Repeated lore queries benefit from Convex caching.
- Prefer deterministic prompts for repeated lookups to maximise cache hits.

### Media Optimisation (ABR)
- Use Cloudinary Adaptive Bitrate Streaming.
- Serve lower resolutions on mobile to reduce bandwidth cost.

## Operational Guidance
- Avoid shared global logs or counters; keep per-user or per-room documents.
- Batch or debounce writes when feasible.
- Log model usage and bandwidth per feature to identify expensive flows.

## Funding Narrative (Short)
- Infrastructure costs stay low until large user volumes.
- COGS grows with user activity; we pay only when users receive value.
- A small paid tier can cover substantial interactive usage.
