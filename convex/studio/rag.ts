
import { v } from "convex/values";
import { internalMutation, internalQuery, internalAction, action } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireStudioAccessAction } from "../auth/helpers";

// ═══════════════════════════════════════════════════════════════
// SOVEREIGN RAG ENGINE - Gemini Native Embeddings
// ═══════════════════════════════════════════════════════════════

// Helper to patch the embedding back to the database
export const patchEmbedding = internalMutation({
    args: { id: v.id("reveals"), embedding: v.array(v.float64()) },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { embedding: args.embedding });
    }
});

export const getCanonicalData = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("reveals").collect();
    }
});

// ═══════════════════════════════════════════════════════════════
// CORE LOGIC: Canon Reindexing
// ═══════════════════════════════════════════════════════════════

async function reindexCanonCore(ctx: any) {
    const data = await ctx.runQuery(internal.studio.rag.getCanonicalData);
    const published = (data || []).filter((d: any) => d.status === 'published' || d.status === 'Published');

    console.log(`[REINDEX] Starting reindex of ${published.length} canon items...`);

    let successCount = 0;
    let skipCount = 0;

    for (const item of published) {
        // Skip items with empty or missing content
        if (!item.content || item.content.trim().length === 0) {
            console.log(`[REINDEX] Skipping "${item.title}" - empty content`);
            skipCount++;
            continue;
        }

        console.log(`[REINDEX] Processing: "${item.title}"`);

        // Construct rich text for indexing
        const text = `Title: ${item.title}\nType: ${item.type}\nContent: ${item.content}\nVoice: ${item.voice || "Unknown"}`;

        try {
            // Generate Embedding via Gemini
            const embedding = await ctx.runAction(internal.lib.embeddings.fetchEmbedding, { text });

            // Save to native vector field
            await ctx.runMutation(internal.studio.rag.patchEmbedding, {
                id: item._id,
                embedding
            });
            successCount++;
        } catch (e: any) {
            console.error(`[REINDEX] Failed to embed "${item.title}":`, e.message || e);
        }
    }
    console.log(`[REINDEX] Complete. Success: ${successCount}, Skipped: ${skipCount}`);
    return { success: successCount, skipped: skipCount };
}

export const reindexCanon = internalAction({
    args: {},
    handler: async (ctx) => {
        return await reindexCanonCore(ctx);
    }
});

export const triggerReindex = action({
    args: {},
    handler: async (ctx) => {
        // Use action-specific auth check
        await requireStudioAccessAction(ctx);
        console.log("[TRIGGER] Starting Sanctuary Canon Reindex...");
        const result = await reindexCanonCore(ctx);
        return `Sanctuary Canon Reindexed. Success: ${result.success}, Skipped: ${result.skipped}`;
    }
});
