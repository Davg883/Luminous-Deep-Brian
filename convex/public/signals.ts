import { query } from "../_generated/server";
import { v } from "convex/values";

export const getSignal = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("signals")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});

export const listSignals = query({
    handler: async (ctx) => {
        // Fetch all signals (assuming public ones are all "published" for now, or filter by publishedAt)
        return await ctx.db
            .query("signals")
            .withIndex("by_season_episode")
            .order("desc") // Newest episodes first
            .collect();
    },
});
