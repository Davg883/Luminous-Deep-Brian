import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Room State Persistence — Spatial Memory for the Sanctuary
 * 
 * Brian calls this to "pin" insights to the walls of the Sanctuary.
 * Each room maintains its own A2UI state, personalised per user.
 * 
 * This creates true "Spatial Persistence" — when an agent modifies
 * the room, it stays changed across page reloads and sessions.
 */

/**
 * persistRoomUpdate — Called by Brian after every UI modification
 * 
 * Upserts the room state: creates if new, patches if existing.
 * Updated V2: Now supports updating High-Level Objective and Status.
 */
export const persistRoomUpdate = mutation({
    args: {
        roomId: v.string(),
        component: v.string(),
        props: v.string(), // JSON stringified props
        objective: v.optional(v.string()), // NEW: Intent HUD Support
        status: v.optional(v.string()),    // NEW: Intent HUD Support
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject || "guest";

        const existing = await ctx.db
            .query("room_state")
            .withIndex("by_user_room", (q) =>
                q.eq("userId", userId).eq("roomId", args.roomId)
            )
            .first();

        // Build patch object to only update provided fields
        const updates: any = {
            activeComponent: args.component,
            componentProps: args.props,
            lastUpdated: Date.now(),
        };

        if (args.objective) updates.currentObjective = args.objective;
        if (args.status) updates.currentStatus = args.status;

        if (existing) {
            await ctx.db.patch(existing._id, updates);
            return { action: "updated", id: existing._id };
        } else {
            const id = await ctx.db.insert("room_state", {
                userId,
                roomId: args.roomId,
                activeComponent: args.component,
                componentProps: args.props,
                currentObjective: args.objective,
                currentStatus: args.status,
                lastUpdated: Date.now(),
            });
            return { action: "created", id };
        }
    },
});

/**
 * updateObjective - Stores the current high-level user goal for the room.
 */
export const updateObjective = mutation({
    args: {
        roomId: v.string(),
        objective: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject || "guest";

        const existing = await ctx.db
            .query("room_state")
            .withIndex("by_user_room", (q) =>
                q.eq("userId", userId).eq("roomId", args.roomId)
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                currentObjective: args.objective,
                lastUpdated: Date.now(),
            });
            return { action: "updated", id: existing._id };
        }

        const id = await ctx.db.insert("room_state", {
            userId,
            roomId: args.roomId,
            currentObjective: args.objective,
            lastUpdated: Date.now(),
        });
        return { action: "created", id };
    },
});

/**
 * getRoomState — Reactive query for frontend hydration
 * 
 * The A2UIRenderer subscribes to this query. When room state
 * changes (via agent action), the UI automatically updates.
 */
export const getRoomState = query({
    args: { roomId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject || "guest";

        return await ctx.db
            .query("room_state")
            .withIndex("by_user_room", (q) =>
                q.eq("userId", userId).eq("roomId", args.roomId)
            )
            .first();
    },
});

/**
 * clearRoomState — Admin utility for resetting room UI
 * 
 * Removes the active component from a room, returning it
 * to its default (empty) state.
 */
export const clearRoomState = mutation({
    args: { roomId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorised");

        const existing = await ctx.db
            .query("room_state")
            .withIndex("by_user_room", (q) =>
                q.eq("userId", identity.subject).eq("roomId", args.roomId)
            )
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
            return { action: "cleared", roomId: args.roomId };
        }

        return { action: "no_op", roomId: args.roomId };
    },
});

/**
 * getAllRoomStates — Get all room states for current user
 * 
 * Useful for debugging and admin interfaces.
 */
export const getAllRoomStates = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject || "guest";

        return await ctx.db
            .query("room_state")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();
    },
});

/**
 * adminClearRoom — PANIC BUTTON for AI Development
 * 
 * Bypasses auth for CLI usage. When Brian breaks the UI with bad props,
 * run: npx convex run roomState:adminClearRoom '{"roomId": "control_room"}'
 * 
 * This is a DevTool — essential when teaching AI new tricks.
 */
export const adminClearRoom = mutation({
    args: { roomId: v.string() },
    handler: async (ctx, args) => {
        // No auth check — 'npx convex run' acts as Root/Admin
        const existing = await ctx.db
            .query("room_state")
            .filter((q) => q.eq(q.field("roomId"), args.roomId))
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
            console.log(`[ADMIN] Cleared state for room: ${args.roomId}`);
            return { action: "cleared", roomId: args.roomId };
        } else {
            console.log(`[ADMIN] No state found for room: ${args.roomId}`);
            return { action: "no_state_found", roomId: args.roomId };
        }
    },
});
