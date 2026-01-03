import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * GENESIS DB OPERATIONS
 * 
 * Helper mutations for the Genesis Pipeline.
 * These must be in a separate file from the "use node" action.
 */

export const saveContent = internalMutation({
    args: {
        story: v.object({
            title: v.string(),
            slug: v.optional(v.string()),
            content: v.optional(v.string()), // Relaxed validation
            author: v.optional(v.string()),
            roomId: v.optional(v.string()),
            tier: v.string(),
        }),
        artifacts: v.array(v.object({
            keywords: v.array(v.string()),
            title: v.string(),
            content: v.optional(v.string()), // Relaxed validation
            type: v.string(),
        }))
    },
    handler: async (ctx, args) => {
        const slug = args.story.slug || args.story.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        // Save Story
        const storyId = await ctx.db.insert("stories", {
            title: args.story.title,
            slug: slug,
            content: args.story.content || "Content corrupted.", // Default provided
            author: args.story.author || "Unknown",
            roomId: args.story.roomId || "study",
            tier: args.story.tier,
            publishedAt: Date.now()
        });

        // Save Artifacts & Link to Story
        for (const art of args.artifacts) {
            // Validate type against schema
            const validTypes = ["Myth", "Signal", "Reflection"];
            const finalType = validTypes.includes(art.type) ? art.type : "Signal";

            await ctx.db.insert("artifacts", {
                ...art,
                content: art.content || "Analysis pending.", // Default provided
                type: finalType as "Myth" | "Signal" | "Reflection",
                relatedStoryId: storyId,
                createdAt: Date.now(),
                createdBy: "GENESIS_PROTOCOL",
            });
        }

        console.log(`[Genesis] Saved story '${args.story.title}' (${slug}) with ${args.artifacts.length} artifacts.`);
    }
});
