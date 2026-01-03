import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * logSpend - Persist a verified ledger entry.
 */
export const logSpend = mutation({
    args: {
        amountGBP: v.number(),
        allocation: v.string(),
        merchant: v.optional(v.string()),
        date: v.string(),
        scanId: v.optional(v.string()),
        verifiedBy: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject || "guest";

        const id = await ctx.db.insert("ledger", {
            userId,
            amountGBP: args.amountGBP,
            allocation: args.allocation,
            merchant: args.merchant ?? "UNKNOWN VENDOR",
            date: args.date,
            scanId: args.scanId,
            verifiedBy: args.verifiedBy ?? "Julian",
            createdAt: Date.now(),
        });

        return { id };
    },
});

/**
 * signEntry - Adds a neural signature to a ledger entry.
 */
export const signEntry = mutation({
    args: {
        entryId: v.id("ledger"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject || "guest";
        const now = Date.now();

        await ctx.db.patch(args.entryId, {
            signedAt: now,
            signedBy: userId,
        });

        return { signedAt: now, signedBy: userId };
    },
});

/**
 * getRecentAllocations - Query recent ledger entries for the authenticated user.
 * This is Brian's "memory retrieval" function.
 */
export const getRecentAllocations = query({
    args: { limit: v.number() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("ledger")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .take(args.limit);
    },
});
