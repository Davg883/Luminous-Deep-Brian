import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const upsertMediaRecord = internalMutation({
    args: {
        publicId: v.string(),
        url: v.string(),
        resourceType: v.string(),
        folder: v.optional(v.string()),
        format: v.string(),
        bytes: v.number(),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("media")
            .withIndex("by_public_id", (q) => q.eq("publicId", args.publicId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, args);
        } else {
            await ctx.db.insert("media", args);
        }
    },
});
