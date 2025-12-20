# Content Templates (Canonical Shapes)

## 1. Hotspot Content Pack (User Experience Payload)

**Purpose:** The atomic unit of story/reveal content. Gemini outputs must conform to this shape.

### JSON Structure
```json
{
  "hotspot_id": "string (unique_slug)",
  "domain": "Home | Workshop | Study | Boathouse",
  "scene_id": "string (slug)",
  "hotspot_title": "string (short label)",
  "reveal_type": "text | audio | video | image",
  "body_copy": "string (markdown, 150-300 words for Text)",
  "hint_line": "string (optional, subtle pointer)",
  "tags": ["theme", "puzzle_clue", "chronology"],
  "canon_refs": ["lamp", "journal", "timeline_v1"],
  "media_refs": "folder/public_id (no raw URLs)",
  "status": "Draft | Review | Published",
  "version": 1,
  "last_reviewed_by": "human_handle",
  "canon_check_result": "Pass | Needs Fix | Reject"
}
```

## 2. Scene Prompt Pack (Visual Production Brief)

**Purpose:** Generates consistent visuals across time-of-day variants.

### Markdown Structure
```markdown
# Scene Prompt Pack: [Scene Name]

## Core Visuals
**Subject:** [Detailed description of the room/view]
**Framing:** [Camera angle, depth of field, center-safe guidelines]
**Continuity Rules:**
- [Architecture fixed]
- [Lamp positions stable]
- [Palette consistent with domain]

## Negative Constraints
- NO people or faces.
- NO voyeuristic framing.
- NO text baked into image/video.
- NO horror/jump-scare energy.

## Prompt Variants
### Hero Loop
[Prompt text for main loop]

### Micro Motion
[Prompt for subtle movement (e.g., dust, curtain)]

### Transition
[Prompt for entering/leaving scene]
```

## 3. Canon Ledger (Referenced by Canon Role)
*This is the schema validation target.*
All packs must reference canon via `canon_refs` to:
- Recurring objects (lamp, notebook, kettle, planner)
- Timeline anchors
- Tone rules per domain
- Forbidden vibes list
