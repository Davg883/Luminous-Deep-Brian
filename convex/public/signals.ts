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
