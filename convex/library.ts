import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLibraryState = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.tokenIdentifier;

        // 1. Fetch all signals sorted by Season/Episode
        const signals = await ctx.db
            .query("signals")
            .withIndex("by_season_episode")
            .order("desc") // Newest first, usually. But for "Next Episode", ascending might be easier logic. 
            // Actually "Netflix style" usually shows newest "released" but you play in order.
            // Let's sort ASCending to determine the "next up". 
            // Wait, the previous listSignals was desc. 
            // For determining the "Hero" (next to watch), we need them in chronological order.
            .collect();

        // Sort them just in case index order isn't perfect for multi-season
        // (Composite index handles it but let's be safe on the array manipulation)
        // Actually .order("asc") on by_season_episode is perfect: S0 E1, S0 E2, ...
        // Let's re-query or just reverse if needed. 
        // PROMPT SAYS: "Identify the 'Hero Signal' (the first signal where isCompleted is false)."
        // This implies chronological order (Start at Ep 1).

        // Let's sort in memory to be sure.
        const sortedSignals = [...signals].sort((a, b) => {
            if (a.season !== b.season) return a.season - b.season;
            return a.episode - b.episode;
        });

        // 2. Fetch User Progress
        let userProgressMap = new Map();
        if (userId) {
            const progressRecords = await ctx.db
                .query("user_progress")
                .withIndex("by_user_signal", (q) => q.eq("userId", userId))
                .collect();

            for (const record of progressRecords) {
                userProgressMap.set(record.signalId, record);
            }
        }

        // 3. Identify Hero Signal
        let heroSignal = null;
        let nextIndex = 0;

        for (let i = 0; i < sortedSignals.length; i++) {
            const sig = sortedSignals[i];
            const progress = userProgressMap.get(sig._id);
            const isCompleted = progress?.isCompleted ?? false;

            if (!isCompleted) {
                heroSignal = sig;
                nextIndex = i;
                break;
            }
        }

        // If all completed, hero is the last one (or maybe a "season finish" state? For now, last one).
        if (!heroSignal && sortedSignals.length > 0) {
            heroSignal = sortedSignals[sortedSignals.length - 1];
        }

        // 4. Return State
        return {
            heroSignal: heroSignal ? {
                ...heroSignal,
                userProgress: userProgressMap.get(heroSignal._id) || null
            } : null,
            signals: sortedSignals.map(sig => ({
                ...sig,
                userProgress: userProgressMap.get(sig._id) || null
            }))
        };
    },
});
