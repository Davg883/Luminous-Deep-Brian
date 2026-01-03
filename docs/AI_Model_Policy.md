# AI Model Policy

## Text + Reasoning
- Default: `models/gemini-3-flash-preview`
- Used by CopilotKit runtime and Convex text/vision actions.

## Image Generation
- Primary: `gemini-3-pro-image-preview`
- Fallback: `gemini-2.5-flash-image`
- Legacy: avoid `gemini-2.0-flash-preview-image-generation` (deprecated in this stack)

## Tiering Guidance
- Flash tier for most interactions.
- Pro image model reserved for premium/high-fidelity output.

## Where It Lives
- CopilotKit relay: `app/api/copilotkit/route.ts`
- Image pipeline: `convex/studio/imaging.ts`
