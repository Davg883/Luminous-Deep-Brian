# Agent to UI

## Purpose
A2UI, AG-UI, and CopilotKit form a three-layer stack that turns user intent into a safe, portable, and dynamic interface. The agent produces UI as data; the protocol streams and synchronizes it; the runtime renders it using an approved component registry.

## Layered Architecture
- **Specification (A2UI)**: Declarative JSON schema for UI components.
- **Protocol (AG-UI)**: Event-driven transport for messages, tools, and UI updates.
- **Runtime (CopilotKit)**: Client + server implementation that renders A2UI and handles tools.

## Why Declarative JSON
- **Security**: UI is data, not code. Prevents XSS and prompt injection.
- **Portability**: Same JSON renders across web, mobile, and CLI targets.
- **Stability**: Incremental streaming reduces latency and failure risk.

## A2UI Core Concepts
- **Adjacency List**: Flat component list with id references instead of deeply nested trees.
- **Surfaces**: Logical UI containers updated by messages.
- **Actions**: UI controls map to approved tool handlers.

## A2UI Message Types
Only one per message:
- `beginRendering`: Initialize a surface.
- `surfaceUpdate`: Provide component definitions.
- `dataModelUpdate`: Patch values via JSON Pointer.
- `deleteSurface`: Remove a surface.

## AG-UI Protocol
- Transport via SSE or WebSocket.
- Standard event types: `TEXT_MESSAGE_CONTENT`, `TOOL_CALL`, `SURFACE_UPDATE`.
- Uses JSON Patch for shared state deltas.

## End-to-End Data Flow
1. User sends text in UI.
2. Frontend sends AG-UI event to backend.
3. Agent decides: text only or UI update.
4. Agent streams text + A2UI payload.
5. Client renderer maps A2UI to Registry components.
6. User interacts; actions return to agent.

## A2UI Composer
Visual builder that outputs valid A2UI JSON and prompt templates to reduce schema drift.

## Operational Notes
- **Registry Lock-In**: Agent can only use components you implement.
- **Prompt Fragility**: Always parse and validate JSON with fallbacks.
- **Token Cost**: A2UI payloads are verbose; stream and patch where possible.

## Recommended Resources
- A2UI spec: https://github.com/google/A2UI
- CopilotKit: https://github.com/CopilotKit/CopilotKit
- AG-UI docs: https://docs.ag-ui.com/
- A2UI Composer: https://a2ui-editor.copilotkit.ai/
