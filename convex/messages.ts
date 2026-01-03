import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveMessage = mutation({
    args: {
        role: v.string(),
        content: v.string(),
        sourceId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            console.log("[messages.saveMessage] Skipping persistence for guest user");
            return { action: "skipped_anonymous" };
        }

        if (args.sourceId) {
            const existing = await ctx.db
                .query("messages")
                .withIndex("by_user_source", (q) =>
                    q.eq("userId", identity.subject).eq("sourceId", args.sourceId)
                )
                .first();
            if (existing) return { action: "exists", id: existing._id };
        }

        const id = await ctx.db.insert("messages", {
            userId: identity.subject,
            role: args.role,
            content: args.content,
            sourceId: args.sourceId,
            createdAt: Date.now(),
        });

        return { action: "created", id };
    },
});

export const getMessages = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const limit = args.limit ?? 200;

        return await ctx.db
            .query("messages")
            .withIndex("by_user_created", (q) =>
                q.eq("userId", identity.subject)
            )
            .order("asc")
            .take(limit);
    },
});

export const getRecentMessages = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const limit = args.limit ?? 5;

        return await ctx.db
            .query("messages")
            .withIndex("by_user_created", (q) =>
                q.eq("userId", identity.subject)
            )
            .order("desc")
            .take(limit);
    },
});
