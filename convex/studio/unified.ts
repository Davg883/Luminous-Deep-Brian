import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireStudioAccess } from "../auth/helpers";

export const listUnifiedContent = query({
    args: {},
    handler: async (ctx) => {
        await requireStudioAccess(ctx);

        // 1. Fetch Published Reveals (and their links)
        const reveals = await ctx.db.query("reveals").collect();
        const objects = await ctx.db.query("objects").collect();
        const scenes = await ctx.db.query("scenes").collect();

        // Helper Map for Scenes
        const sceneMap = new Map((scenes || []).map(s => [s._id.toString(), s]));
        const sceneSlugMap = new Map((scenes || []).map(s => [s.slug, s]));

        // Enrich Reveals
        const linkedRevealIds = new Set(objects.filter(obj => obj.revealId).map(obj => obj.revealId!.toString()));
        const enrichedReveals = await Promise.all(reveals.map(async (reveal) => {
            const isLinked = linkedRevealIds.has(reveal._id.toString());
            const linkedObject = objects.find(obj => obj.revealId?.toString() === reveal._id.toString());

            let sceneTitle = "Unknown";
            let sceneSlug = "home";

            // Determine Scene from Object Link OR SpaceID
            if (linkedObject) {
                const s = sceneMap.get(linkedObject.sceneId.toString());
                if (s) { sceneTitle = s.title; sceneSlug = s.slug; }
            } else if (reveal.spaceId) {
                const s = sceneMap.get(reveal.spaceId.toString());
                if (s) { sceneTitle = s.title; sceneSlug = s.slug; }
            }

            return {
                _id: reveal._id,
                title: reveal.title,
                content: reveal.content,
                type: reveal.type,
                status: "Published",
                source: "reveal",
                scene_slug: sceneSlug,
                scene_title: sceneTitle,
                _creationTime: reveal._creationTime,
                isLinked,
                phase: reveal.phase,
                voice: reveal.voice,
                packData: null
            };
        }));

        // 2. Fetch Draft Packs
        const packs = await ctx.db.query("contentPacks").collect();
        const enrichedPacks = packs.map(pack => {
            let sceneTitle = "Unknown";
            let sceneSlug = "home";

            // Try to resolve scene title from pack data
            if (pack.sceneId) {
                const s = sceneMap.get(pack.sceneId.toString());
                if (s) { sceneTitle = s.title; sceneSlug = s.slug; }
            } else if (pack.domain) {
                const s = sceneSlugMap.get(pack.domain.toLowerCase());
                if (s) { sceneTitle = s.title; sceneSlug = s.slug; }
                else { sceneSlug = pack.domain; }
            }

            return {
                _id: pack._id,
                title: pack.title,
                content: pack.bodyCopy,
                type: pack.revealType,
                status: "Draft",
                source: "pack",
                scene_slug: sceneSlug,
                scene_title: sceneTitle,
                _creationTime: pack._creationTime,
                isLinked: false, // Packs are never placed on the map
                phase: pack.phase,
                voice: null, // Resolves later
                packData: pack // Keep raw pack data for editing
            };
        });

        // 3. Merge & Sort
        const unified = [...enrichedReveals, ...enrichedPacks];
        return unified.sort((a, b) => b._creationTime - a._creationTime);
    }
});
