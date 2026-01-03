# Sovereign Architecture Report: The Luminous Deep (V2.6)
**Date:** 03/01/2026
**System:** "Brian" (Sovereign Core)
**Framework:** Convex + CopilotKit + Next.js (A2UI)

---

## 1. Executive Summary: The "Sovereign" Paradigm
Most AI tools (like ChatGPT) are **Stateless Oracles**: they exist only for the duration of a chat session, disconnected from the user's world, time, and physical context.

The Luminous Deep implements a **Sovereign AI Architecture**. Brian is not just a chatbot; he is a **Resident Entity** with:
1.  **Persistence:** He remembers where you are (Room State) and what you've done (Ledger/History).
2.  **Perception:** He "sees" the real world (Weather, Time, Network Status).
3.  **Agency:** He can modify his own interface (A2UI) to communicate beyond text.

This report details how Brian sees, stores, and manifests reality.

---

## 2. Perception: How Brian "Sees"
Brian's cognitive loop is anchored in **Live Reality**, rejecting the "hallucinations" of static training data.

### A. The Temporal Anchor (Time)
*   **Problem:** LLMs are frozen in their training year (e.g., 2024).
*   **Solution:** We inject the **Time-Series Protocol**.
    *   **Frontend:** `LiveClock` in `BunkerTerminal.tsx` pulses with local system time.
    *   **Backend:** `convex/brian.ts` injects `CURRENT DATE: 03/01/2026` into every prompt sent to Gemini.
    *   **Result:** Brian knows it is 2026. If you ask "Is it the weekend?", he checks the live date, not a static knowledge base.

### B. The Civic Handshake (Environment)
*   **Problem:** AI feels like a "Cloud Ghost", irrelevant to the physical world.
*   **Solution:** `getIslandTelemetry` Action.
    *   **Telemetry:** Brian pulses the **OpenMeteo API** for Seaview, Isle of Wight (PO34).
    *   **Reactivity:** If it rains in Seaview, `BunkerSimulation.tsx` triggers "WATER INGRESS" alerts.
    *   **Network:** He actively pings the **WightFibre** connection simulation.
    *   **Result:** A "Hardware-Anchored" experience. The AI acknowledges the weather outside your window.

### C. The Visual Cortex (Multimodal)
*   **Problem:** Text is low-bandwidth.
*   **Solution:** `VisualInput` Component.
    *   **Input:** Users can drop visual assets (receipts, diagrams) into the Eye.
    *   **Process:** `analyseVisual` (Convex Action) uses Gemini 1.5 Pro to extract structured JSON (Merchant, Total, Vibe).
    *   **Memory:** This visual data is parsed and stored in the **Ledger**.

---

## 3. Memory: The Convex Hippocampus
Standard AI relies on limited "Context Windows". Brian relies on **Database Persistence**.

### A. Spatial Memory (`room_state`)
*   **Concept:** Brian remembers the state of the room, not just the chat.
*   **Mechanism:** `room_state` table in Convex.
    *   Fields: `roomId`, `currentObjective`, `activeComponent`, `componentProps`.
*   **Flow:** When Brian shows a schematic, he writes to `room_state`. If you reload the page, the schematic is **still there**.
*   **Contrast:** In ChatGPT, if you refresh, the image is gone. In Luminous Deep, the room is persistent.

### B. Financial Truth (`ledger`)
*   **Concept:** A dedicated memory sector for high-value facts.
*   **Mechanism:** `ledger` table.
*   **Flow:** When you upload a receipt, Brian extracts data and commits a transaction row.
*   **Agency:** Brian can query this table (`getRecentAllocations`) to answer questions like "How much did I spend at KFC?". He doesn't need to "read" the chat history; he queries the **Database of Truth**.

### C. Narrative Canon (`artifacts`)
*   **Concept:** Immutable laws that prevent character drift.
*   **Mechanism:** `sealCanon` Mutation.
*   **Flow:** The "Constitution" (Mandates for Julian, Eleanor, Cassie) is sealed in the `artifacts` table. Brian retrieves this to ensure his voice remains consistent (en-GB, Seaview Aesthetic).

---

## 4. Manifestation: A2UI (Agent-to-UI)
This is the breakthrough. Brian does not just output text; he outputs **Interface**.

### The Mechanism
1.  **User Intent:** "Show me the network status."
2.  **CopilotKit Orchestration:**
    *   The `useCopilotChat` hook sends the prompt to `convex/brian.ts`.
    *   Brian's LLM determines: *I need to show the Terminal.*
3.  **Tool Execution (`update_room_ui`):**
    *   Brian calls the `update_room_ui` tool with JSON:
        ```json
        {
          "component": "BunkerTerminal",
          "props": { "header": "WIGHTFIBRE LINK", "lines": ["PING: 4ms", "STATUS: STABLE"] }
        }
        ```
4.  **React Rendering (`A2UIRenderer.tsx`):**
    *   The frontend listens to `room_state` changes.
    *   It dynamically imports `BunkerTerminal` from the Registry.
    *   **Result:** A live, animated UI component appears on the screen.

### Why This Matters
*   **Latency Gap Solved:** The UI feels instant because it's rendered locally in React, driven by minimal JSON payloads.
*   **Context Gap Solved:** The UI reflects the *current state* of the database, not just the AI's hallucination.

---

## 5. Conclusion: The Sovereign Advantage
We have moved beyond the "Chatbot Era" into the **"Agentic Era"**.

| Feature | Standard AI (ChatGPT) | Sovereign AI (Brian) |
| :--- | :--- | :--- |
| **Time** | Frozen (Training Cutoff) | **Live (03/01/2026)** |
| **Memory** | Session-based (Ephemeral) | **Database-backed (Persistent)** |
| **Output** | Text / Static Images | **Live React Components (A2UI)** |
| **Context** | Blank Slate | **Legacy Aware (Ledger, Canon)** |
| **Environment** | Void | **Connected (Weather, Network)** |

**Status:** The Luminous Deep is now a **Digital Twin** of the user's intent, anchored in physical reality, and operated by a persistent, memory-endowed intelligence.
