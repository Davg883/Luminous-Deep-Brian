import { internalMutation, mutation } from "./_generated/server";

export const wipeAllData = internalMutation({
    args: {},
    handler: async (ctx) => {
        const tables = ["objects", "reveals", "chapters", "scenes", "media", "contentPacks"];

        for (const table of tables) {
            const records = await ctx.db.query(table as any).collect();
            for (const record of records) {
                await ctx.db.delete(record._id);
            }
        }

        return "All data wiped from: " + tables.join(", ");
    },
});

// Cleanup mutation to fix luminous-deep scene media
export const cleanupLuminousDeep = mutation({
    args: {},
    handler: async (ctx) => {
        const CORRECT_VIDEO_URL = "https://res.cloudinary.com/dptqxjhb8/video/upload/v1766323557/LD_luminous-deep_scene_main_v1.mp4";

        // Step A: Find all scenes with domain "luminous-deep"
        const allScenes = await ctx.db.query("scenes").collect();
        const luminousDeepScenes = allScenes.filter(s => s.domain === "luminous-deep");

        console.log(`Found ${luminousDeepScenes.length} scenes with domain 'luminous-deep'`);

        const actions: string[] = [];

        // Step B: If duplicates, delete "The Control Room", keep "The Luminous Deep"
        if (luminousDeepScenes.length > 1) {
            for (const scene of luminousDeepScenes) {
                if (scene.title === "The Control Room") {
                    await ctx.db.delete(scene._id);
                    actions.push(`Deleted duplicate scene: ${scene.title} (${scene._id})`);
                }
            }
        }

        // Step C & D: Find and update the correct scene
        const targetScene = luminousDeepScenes.find(s =>
            s.slug === "luminous-deep" || s.title === "The Luminous Deep"
        );

        if (targetScene) {
            await ctx.db.patch(targetScene._id, {
                backgroundMediaUrl: CORRECT_VIDEO_URL,
                isPublished: true,
            });
            actions.push(`Updated scene '${targetScene.title}' with correct video URL`);
            actions.push(`Set isPublished = true`);
        } else {
            actions.push("WARNING: Could not find 'The Luminous Deep' scene to update");
        }

        // Also check for any scene with slug "luminous-deep" regardless of domain
        const slugMatch = allScenes.find(s => s.slug === "luminous-deep");
        if (slugMatch && slugMatch._id !== targetScene?._id) {
            await ctx.db.patch(slugMatch._id, {
                domain: "luminous-deep",
                backgroundMediaUrl: CORRECT_VIDEO_URL,
                isPublished: true,
            });
            actions.push(`Fixed scene by slug match: ${slugMatch.title}`);
        }

        return actions.join("\n");
    },
});

// Set shouldLoop for all scenes
export const setShouldLoopForScenes = mutation({
    args: {},
    handler: async (ctx) => {
        const allScenes = await ctx.db.query("scenes").collect();
        const actions: string[] = [];

        for (const scene of allScenes) {
            // luminous-deep = cinematic (no loop), others = atmosphere (loop)
            const shouldLoop = scene.domain !== "luminous-deep";
            await ctx.db.patch(scene._id, { shouldLoop });
            actions.push(`${scene.title}: shouldLoop = ${shouldLoop}`);
        }

        return actions.join("\n");
    },
});
