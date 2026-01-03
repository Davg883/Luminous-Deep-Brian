# Error Report (Dev Mode)

## Summary
The observed console messages are performance warnings and dev-mode artifacts tied to CopilotKit Inspector and AG-UI stream handling. They are not fatal but can block the main thread in development builds.

## 1) Violation Warning ('message' handler took ~173ms)
**Cause**
- CopilotKitInspector `useEffect` processes AG-UI stream events.
- Dev mode (React Strict Mode + CopilotKit debug checks) increases overhead.
- Large A2UI payloads or rapid state updates can spike main-thread time.

**Resolution**
- Safe to ignore in dev if UI remains responsive.
- Temporarily remove `<CopilotKitInspector />` (or debug sidebar) to confirm source.
- In production builds these checks are disabled.

## 2) Lit Dev Mode Warning
**Cause**
- CopilotKit/A2UI uses Lit components in development mode.

**Resolution**
- No action required. Warning disappears in production builds.

## 3) PendingScript / Hydration Lag
**Cause**
- Large streamed payloads can delay Next.js App Router hydration.
- Runtime URL misconfiguration can trigger retries and extra processing.

**Resolution**
- Ensure CopilotKit runtime endpoint responds with 200 OK.
- Keep A2UI payloads small; stream/update incrementally.
- Validate system prompts to avoid oversized component trees.

## Recommended Checks
- Run production build: `npm run build && npm start`.
- If still slow, disable Inspector and re-test.
- Confirm `<CopilotKit runtimeUrl="/api/copilotkit" publicApiKey={process.env.NEXT_PUBLIC_COPILOT_KEY}>`.
