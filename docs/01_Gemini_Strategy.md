# Gemini 3 Pro Strategy: The Content Intelligence Layer

## 1. Product Role
Gemini 3 Pro serves as the **"Writers' Room"** for Luminous Deep. It is not a runtime engine; it is a build-time and studio-time assistant that drafts content, designs puzzles, and ensures narrative consistency.

The live site (Next.js + Convex) remains a deterministic "museum engine" that only renders approved, canonical content.

## 2. The Three Model Roles Pattern

### A) Planner (Architect)
- **Job:** Structure, logic, sequencing, puzzle design.
- **Output:**
    - Hotspot storyline arcs ("Arrival", "First Reveal").
    - Structured "Content Packs" (JSON/Markdown).
    - Tagging proposals (domain/scene connections).
    - Breadcrumb trails and puzzle logic.
- **Goal:** create the *skeleton* of the experience.

### B) Visual (Art Director)
- **Job:** Generate the visual language (via external image models).
- **Output:** "Scene Prompt Packs" containing lighting, framing, and mood instructions.
- **Goal:** ensure visual continuity (e.g., maintaining the same lamp position across lighting shifts).

### C) Canon (Editor in Chief)
- **Job:** Continuity editor and tone guardian.
- **Output:**
    - "Voice Compliance" checks (e.g., "This sounds too technical for Eleanor").
    - Lore integrity checks (timelines, recurring motifs).
    - Safety filters (rejecting creepy/voyeuristic content).
- **Goal:** prevent "drift" and maintain the house's specific atmosphere.

## 3. Workflow Implementation

### Build-Time (The Foundation)
Gemini assists in authoring and maintaining the core documentation (files in `docs/`):
- Foundation Spec
- Naming & Tagging Standards
- Content Templates

### Studio-Time (The Content Factory)
When creating new content in the Studio:
1.  **Draft:** Human selects a domain/scene. Gemini proposes 3 hotspot candidates and draft copy.
2.  **Review:** Context is checked against the **Canon Ledger**.
3.  **Publish:** Human approves. Data is written to Convex as static content.

## 4. Prompting Contracts
To ensure reliability, Gemini agents must adhere to strict I/O contracts:

*   **Planner Prompt Check:** Must output structured `Content Packs` (JSON/Markdown) ONLY. No conversational fluff.
*   **Canon Prompt Check:** Must output `Pass` / `Fail` + `Reasons` + `Required Edits`.
*   **Visual Prompt Check:** Must output text prompts for image models, NOT attempt to generate images itself (unless multi-modal tools are active).

## 5. Guardrails & Scaling
- **Canon Ledger:** A single source of truth for recurring objects and world facts to prevent hallucinations.
- **Publishing Gates:** Content cannot go live without passing tag, length, and voice checks.
- **Asset Indirection:** Gemini references Cloudinary folders/IDs, never raw URLs.

## 6. Domain Voice Mappings
- **The Workshop (Sparkline):** Curiosity, experiments, sketches. (Voice: Cassie)
- **The Study (Hearth):** Reflection, narrative, memory. (Voice: Eleanor)
- **The Boathouse (Systems):** Clarity, blueprints, architecture. (Voice: Julian)