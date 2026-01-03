# Operations Runbook

## Convex
- Regenerate types: `npx convex dev`
- Clear a room (admin): `npx convex run roomState:adminClearRoom '{"roomId": "control_room"}'`

## Common Issues
- Missing chat history: check `messages` table and user auth.
- UI not restoring: verify `room_state` contents and JSON props.
- Image generation fails: check `GOOGLE_API_KEY` and Cloudinary env vars.

## Safe Defaults
- Use flash tier for text/vision.
- Use pro image only for premium outputs.

## Files to Inspect
- `components/A2UIRenderer.tsx`
- `components/registry/SanctuaryTerminal.tsx`
- `convex/messages.ts`
- `convex/roomState.ts`
