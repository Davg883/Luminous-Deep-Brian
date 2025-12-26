import { mutation } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════════
// THEA LUX PROTOCOL: PHASE 1 CONTENT UPGRADE
// ═══════════════════════════════════════════════════════════════

export const upgradeMetadata = mutation({
    args: {},
    handler: async (ctx) => {
        const signals = await ctx.db.query("signals").collect();
        let count = 0;

        for (const signal of signals) {
            let updates = {};

            if (signal.season === 0 && signal.episode === 1) {
                // T001: The Static
                updates = {
                    subtitle: "The Static",
                    summaryShort: "A sealed control room. A system already running. What begins as noise reveals itself as a signal.",
                    summaryLong: "The initial transmission from the Sanctuary. We are introduced to the Operator and the anomaly of the open channel. The system is active, but the origin is unknown.",
                    duration: "18 min read",
                    coverImage: "https://images.unsplash.com/photo-1626126525134-fbbc0ecb94cb?q=80&w=2670&auto=format&fit=crop", // Dark minimal data fog
                    releaseDate: signal.publishedAt || Date.now()
                };
            } else if (signal.season === 0 && signal.episode === 2) {
                // T002: Monitor
                updates = {
                    subtitle: "The Monitor Was Already On",
                    summaryShort: "The screen flickers. Someone else has been here. Or they never left.",
                    summaryLong: "Discovery of the active terminal traces. Analysis of the logs suggests a presence that predates the current timeline.",
                    duration: "12 min read",
                    coverImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop", // Retro screen
                    releaseDate: signal.publishedAt || Date.now()
                };
            }

            if (Object.keys(updates).length > 0) {
                await ctx.db.patch(signal._id, updates);
                count++;
            }
        }

        return `Upgraded ${count} transmissions with Progressive Disclosure metadata.`;
    }
});
