// ... (imports)
import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery, internalAction } from "../_generated/server";
import { api, internal, components } from "../_generated/api";
import { requireStudioAccess } from "../auth/helpers";

export const listPacks = query({
    args: {},
    handler: async (ctx) => {
        await requireStudioAccess(ctx);
        const packs = await ctx.db.query("contentPacks").collect();
        // Sort by newest first
        return packs.sort((a, b) => b._creationTime - a._creationTime);
    },
});

// ... listAllReveals ...
export const listAllReveals = query({
    args: {},
    handler: async (ctx) => {
        await requireStudioAccess(ctx);

        const reveals = await ctx.db.query("reveals").collect();
        const objects = await ctx.db.query("objects").collect();

        const linkedRevealIds = new Set(
            objects
                .filter(obj => obj.revealId)
                .map(obj => obj.revealId?.toString())
        );

        const enrichedReveals = await Promise.all(reveals.map(async (reveal) => {
            const isLinked = linkedRevealIds.has(reveal._id.toString());
            const linkedObject = objects.find(obj => obj.revealId?.toString() === reveal._id.toString());
            let sceneName = null;

            if (linkedObject) {
                const scene = await ctx.db.get(linkedObject.sceneId);
                sceneName = scene?.title || "Unknown Scene";
            }

            let scene_slug = "home";
            if (reveal.spaceId) {
                const space = await ctx.db.get(reveal.spaceId);
                scene_slug = space?.slug || "home";
            }

            return {
                ...reveal,
                isLinked,
                linkedObjectId: linkedObject?._id || null,
                linkedSceneName: sceneName,
                linkedObjectName: linkedObject?.name || null,
                scene_slug,
                isAnchored: isLinked,
            };
        }));

        // Sort by publishedAt (if available) or creationTime, DESC
        return enrichedReveals.sort((a, b) => {
            const timeA = a.publishedAt || a._creationTime;
            const timeB = b.publishedAt || b._creationTime;
            return timeB - timeA;
        });
    },
});

export const listUnlinkedReveals = query({
    args: {},
    handler: async (ctx) => {
        await requireStudioAccess(ctx);
        const reveals = await ctx.db.query("reveals").collect();
        const objects = await ctx.db.query("objects").collect();
        const linkedRevealIds = new Set(objects.map(obj => obj.revealId?.toString()).filter(Boolean));
        // Sort newest first
        return reveals
            .filter(reveal => !linkedRevealIds.has(reveal._id.toString()))
            .sort((a, b) => b._creationTime - a._creationTime);
    },
});

// ... importPack ...
// ... updatePack ...
// ... publishPack ...
// ... deletePack ...
// ... resolveMedia ...
// ... deleteRevealInternal ...
// ... deleteReveal ...

export const reassignRevealSpace = mutation({
    args: {
        revealId: v.id("reveals"),
        newSceneSlug: v.string()
    },
    handler: async (ctx, args) => {
        await requireStudioAccess(ctx);

        // 1. Find the new scene
        const newScene = await ctx.db
            .query("scenes")
            .withIndex("by_slug", (q) => q.eq("slug", args.newSceneSlug))
            .first();

        if (!newScene) {
            throw new Error(`Scene with slug '${args.newSceneSlug}' not found.`);
        }

        // 2. Update the Reveal record
        await ctx.db.patch(args.revealId, {
            spaceId: newScene._id
        });

        // 3. Update any linked Object(s)
        const linkedObjects = await ctx.db
            .query("objects")
            .withIndex("by_scene") // Just scanning is fine if index isn't perfect for this, but we have strict checks
            .filter(q => q.eq(q.field("revealId"), args.revealId))
            .collect();

        for (const obj of linkedObjects) {
            await ctx.db.patch(obj._id, {
                sceneId: newScene._id
            });
        }

        return { success: true, newSceneId: newScene._id, movedObjects: linkedObjects.length };
    }
});

export const importPack = mutation({
    args: {
        hotspotId: v.string(),
        domain: v.string(),
        sceneId: v.id("scenes"),
        title: v.string(),
        revealType: v.string(),
        bodyCopy: v.string(),
        hintLine: v.optional(v.string()),
        tags: v.array(v.string()),
        canonRefs: v.array(v.string()),
        mediaRefs: v.string(),
        status: v.union(v.literal("Draft"), v.literal("Review"), v.literal("Published")),
        version: v.number(),
        sourceFile: v.optional(v.string()),
        overwriteConfirmed: v.optional(v.boolean()),
        phase: v.optional(v.union(
            v.literal("early_year"),
            v.literal("spring"),
            v.literal("summer"),
            v.literal("autumn"),
            v.literal("winter")
        )),
    },
    handler: async (ctx, args) => {
        const identity = await requireStudioAccess(ctx);

        // 1. Check for existing pack with same hotspotId
        const existing = await ctx.db
            .query("contentPacks")
            .withIndex("by_hotspot", (q) => q.eq("hotspotId", args.hotspotId))
            .first();

        if (existing && !args.overwriteConfirmed) {
            return { conflict: true, existingId: existing._id, existingTitle: existing.title };
        }

        if (existing && args.overwriteConfirmed) {
            // Archive existing to history
            await ctx.db.insert("contentPacksHistory", {
                packId: existing._id,
                hotspotId: existing.hotspotId,
                data: existing,
                archivedAt: Date.now(),
                archivedBy: identity.tokenIdentifier,
            });

            // Delete old or we can patch. User said "overwrite confirmed", so let's patch the existing one to keep ID?
            // User script: "Overwriting an existing hotspot requires explicit confirmation and preserves history"
            const { overwriteConfirmed, ...data } = args;
            await ctx.db.patch(existing._id, {
                ...data,
                importedBy: identity.tokenIdentifier,
                version: existing.version + 1,
            });
            return { success: true, id: existing._id, updated: true };
        }

        // 2. Insert new
        const { overwriteConfirmed, ...data } = args;
        const id = await ctx.db.insert("contentPacks", {
            ...data,
            importedBy: identity.tokenIdentifier,
        });
        return { success: true, id };
    },
});


export const updatePack = mutation({
    args: {
        id: v.id("contentPacks"),
        status: v.optional(v.union(v.literal("Draft"), v.literal("Review"), v.literal("Published"))),
        title: v.optional(v.string()),
        bodyCopy: v.optional(v.string()),
        canonCheckResult: v.optional(v.string()),
        lastReviewedBy: v.optional(v.string()),
        phase: v.optional(v.union(
            v.literal("early_year"),
            v.literal("spring"),
            v.literal("summer"),
            v.literal("autumn"),
            v.literal("winter")
        )),
    },
    handler: async (ctx, args) => {
        await requireStudioAccess(ctx);
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const publishPack = mutation({
    args: { id: v.id("contentPacks") },
    handler: async (ctx, args) => {
        await requireStudioAccess(ctx);
        const pack = await ctx.db.get(args.id);
        if (!pack) throw new Error("Pack not found");

        // 0. Integrity Check: Ensure Scene Exists
        let finalSceneId = pack.sceneId;
        const scene = await ctx.db.get(finalSceneId);
        if (!scene) {
            // Attempt recovery via domain/slug
            const recovered = await ctx.db.query("scenes").withIndex("by_slug", q => q.eq("slug", pack.domain.toLowerCase())).first();
            if (recovered) finalSceneId = recovered._id;
            else throw new Error(`Target Scene (ID: ${pack.sceneId}) not found and cannot be recovered via slug ${pack.domain}.`);
        }

        // 1. Map Domain to Canonical Voice
        let voice: any = "systems";
        const domain = pack.domain.toLowerCase();
        if (domain === "workshop") voice = "sparkline";
        else if (domain === "study") voice = "hearth";
        else if (domain === "boathouse") voice = "systems";
        else if (domain === "home") voice = "hearth"; // Default home to Eleanor/Hearth for now

        // 2. Create the Reveal
        const revealId = await ctx.db.insert("reveals", {
            type: pack.revealType as any,
            title: pack.title,
            content: pack.bodyCopy,
            voice,
            tags: pack.tags,
            mediaUrl: pack.mediaRefs, // Link the media ref
            role: "canon",
            status: "published", // Lowercase for backend consistency
            publishedAt: Date.now(),
            spaceId: finalSceneId,
            phase: pack.phase,
        });

        // 3. Create the Object
        await ctx.db.insert("objects", {
            sceneId: finalSceneId,
            name: pack.title,
            x: 55, // Offset slightly from center so overlapping isn't perfect
            y: 45,
            hint: pack.hintLine || `Look closer at the ${pack.title.toLowerCase()}`,
            revealId,
            role: "canon",
        });


        // 4. Delete the draft pack (It has been promoted to Reveal)
        await ctx.db.delete(args.id);
        return { success: true };
    },
});

export const deletePack = mutation({
    args: { id: v.id("contentPacks") },
    handler: async (ctx, args) => {
        await requireStudioAccess(ctx);
        await ctx.db.delete(args.id);
    },
});

export const resolveMedia = query({
    args: { publicId: v.string() },
    handler: async (ctx, args) => {
        await requireStudioAccess(ctx);
        return await ctx.db
            .query("media")
            .withIndex("by_public_id", (q) => q.eq("publicId", args.publicId))
            .first();
    },
});

export const deleteRevealInternal = internalMutation({
    args: { id: v.id("reveals") },
    handler: async (ctx, args) => {
        // Delete the reveal itself
        await ctx.db.delete(args.id);

        // Scan objects for any that link to this reveal (cleanup "ghost dots")
        const objects = await ctx.db
            .query("objects")
            .filter((q) => q.eq(q.field("revealId"), args.id))
            .collect();

        for (const obj of objects) {
            await ctx.db.delete(obj._id);
        }
    },
});

export const deleteReveal = mutation({
    args: { id: v.id("reveals") },
    handler: async (ctx, args) => {
        await requireStudioAccess(ctx);

        // Delete the reveal itself
        await ctx.db.delete(args.id);

        // Scan objects for any that link to this reveal
        const objects = await ctx.db
            .query("objects")
            .filter((q) => q.eq(q.field("revealId"), args.id))
            .collect();

        for (const obj of objects) {
            await ctx.db.delete(obj._id);
        }
    },
});

