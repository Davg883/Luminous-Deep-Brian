import { mutation } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// GEOGRAPHY MIGRATION: Atlantic → Solent (Isle of Wight)
// One-time migration to update canon from generic Atlantic to
// specific Seaview, Isle of Wight location
// ═══════════════════════════════════════════════════════════════

/**
 * Geographic replacements for the Luminous Deep canon
 * Old: Generic Atlantic coast
 * New: Seaview, Isle of Wight overlooking The Solent
 */
const GEOGRAPHY_REPLACEMENTS: [RegExp, string][] = [
    // Primary location updates
    [/\bthe Atlantic\b/gi, "The Solent"],
    [/\bAtlantic Ocean\b/gi, "The Solent"],
    [/\bAtlantic coast\b/gi, "Isle of Wight coast"],
    [/\bAtlantic\b/g, "Solent"], // Generic catch-all

    // Water body terminology
    [/\bocean\b/gi, "strait"],
    [/\bthe ocean\b/gi, "The Solent"],
    [/\bopen water\b/gi, "the strait"],
    [/\bopen sea\b/gi, "The Solent"],

    // Mainland references
    [/\bthe mainland\b/gi, "Portsmouth"],
    [/\bmainland\b/gi, "the Hampshire coast"],
    [/\bdistant shore\b/gi, "Portsmouth Harbour"],
    [/\bfar shore\b/gi, "the Gosport side"],

    // Coastal terminology updates
    [/\bcoastal town\b/gi, "Seaview"],
    [/\bseaside village\b/gi, "Seaview village"],
    [/\bharbour town\b/gi, "Ryde"],

    // Navigation updates
    [/\bshipping lanes\b/gi, "Solent shipping lanes"],
    [/\bcontainer ships\b/gi, "Southampton-bound container ships"],
];

/**
 * Update geography in existing reveals
 * Transforms Atlantic references to Solent/Isle of Wight
 */
export const updateGeography = mutation({
    args: {},
    handler: async (ctx) => {
        console.log("═══════════════════════════════════════════════════════════════");
        console.log("[GEOGRAPHY MIGRATION] Starting Atlantic → Solent transformation");
        console.log("═══════════════════════════════════════════════════════════════");

        // 1. Fetch ALL reveals
        const reveals = await ctx.db.query("reveals").collect();
        console.log(`[GEOGRAPHY MIGRATION] Found ${reveals.length} reveals to scan`);

        let updatedCount = 0;
        let skippedCount = 0;
        const updatedIds: string[] = [];

        // 2. Iterate and transform
        for (const reveal of reveals) {
            // Use 'content' field (the correct schema field)
            const originalContent = reveal.content || "";
            let newContent = originalContent;
            let wasModified = false;

            // Apply all geographic replacements
            for (const [pattern, replacement] of GEOGRAPHY_REPLACEMENTS) {
                if (pattern.test(newContent)) {
                    newContent = newContent.replace(pattern, replacement);
                    wasModified = true;
                }
            }

            // 3. Patch if changed
            if (wasModified && newContent !== originalContent) {
                await ctx.db.patch(reveal._id, {
                    content: newContent,
                    // Clear embedding to force reindex
                    embedding: undefined
                });
                updatedCount++;
                updatedIds.push(reveal._id);
                console.log(`[GEOGRAPHY MIGRATION] Updated: ${reveal.title || reveal._id}`);
            } else {
                skippedCount++;
            }
        }

        // 4. Log summary
        console.log("═══════════════════════════════════════════════════════════════");
        console.log(`[GEOGRAPHY MIGRATION] COMPLETE`);
        console.log(`  ✓ Updated: ${updatedCount} reveals`);
        console.log(`  ○ Skipped: ${skippedCount} reveals (no Atlantic references)`);
        console.log("═══════════════════════════════════════════════════════════════");
        console.log("");
        console.log("⚠️  IMPORTANT: Run the RAG reindex to update vector embeddings!");
        console.log("    → Call: api.studio.rag.triggerReindex");
        console.log("");

        return {
            success: true,
            updatedCount,
            skippedCount,
            updatedIds,
            message: `Geography migration complete. ${updatedCount} reveals updated. Remember to run RAG reindex!`
        };
    }
});

/**
 * Combined migration + reindex
 * Runs geography update then triggers embedding reindex
 */
export const migrateAndReindex = mutation({
    args: {},
    handler: async (ctx) => {
        console.log("[MIGRATION] Starting combined geography migration + reindex...");

        // 1. Run geography update
        const reveals = await ctx.db.query("reveals").collect();
        let updatedCount = 0;

        for (const reveal of reveals) {
            const originalContent = reveal.content || "";
            let newContent = originalContent;
            let wasModified = false;

            for (const [pattern, replacement] of GEOGRAPHY_REPLACEMENTS) {
                if (pattern.test(newContent)) {
                    newContent = newContent.replace(pattern, replacement);
                    wasModified = true;
                }
            }

            if (wasModified && newContent !== originalContent) {
                await ctx.db.patch(reveal._id, {
                    content: newContent,
                    embedding: undefined
                });
                updatedCount++;
            }
        }

        console.log(`[MIGRATION] Geography update complete: ${updatedCount} reveals modified`);
        console.log("[MIGRATION] RAG reindex will need to be triggered separately via action");

        return {
            success: true,
            updatedCount,
            totalReveals: reveals.length,
            message: `Migration complete. ${updatedCount} reveals updated. Call triggerReindex action to update embeddings.`
        };
    }
});
