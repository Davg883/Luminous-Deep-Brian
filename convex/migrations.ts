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

// ═══════════════════════════════════════════════════════════════
// AUDIO SOVEREIGN MIGRATION: Seed Room Soundscapes
// Seeds the ambientAudioUrl for each domain/room
// ═══════════════════════════════════════════════════════════════

/**
 * Room soundscape definitions
 * Each room has a unique 40Hz-infused ambient soundscape
 */
const ROOM_SOUNDSCAPES: Record<string, { url: string; description: string }> = {
    // The Solarium (sanctuary) - Rain on glass, high-altitude wind, soft sine waves
    sanctuary: {
        url: "https://res.cloudinary.com/dptqxjhb8/video/upload/v1735258400/restoration_40hz_hxflz8.mp3",
        description: "Rain on glass, high-altitude wind, soft sine waves",
    },
    // The Workshop - Sub-bass pulses, rhythmic wood planing, metallic resonance
    workshop: {
        url: "https://res.cloudinary.com/dptqxjhb8/video/upload/v1735258400/mechanical_zen_40hz_qw2x9p.mp3",
        description: "Sub-bass pulses, rhythmic wood planing, metallic resonance",
    },
    // The Study - Lo-fi tape hiss, distant lighthouse horn, rhythmic heartbeat
    study: {
        url: "https://res.cloudinary.com/dptqxjhb8/video/upload/v1735258400/archival_memory_40hz_mk7n3r.mp3",
        description: "Lo-fi tape hiss, distant lighthouse horn, rhythmic heartbeat",
    },
    // The Control Room (luminous-deep) - Pure electronic hum, data flow white noise, server cooling
    "luminous-deep": {
        url: "https://res.cloudinary.com/dptqxjhb8/video/upload/v1735258400/system_telemetry_40hz_v9p2lf.mp3",
        description: "Pure electronic hum, 1Gbps data flow white noise, server cooling",
    },
    // The Lounge (Hearth) - Crackling fire, distant waves
    lounge: {
        url: "https://res.cloudinary.com/dptqxjhb8/video/upload/v1735258400/hearth_warmth_40hz_kj8n2m.mp3",
        description: "Crackling fire, distant waves, warm resonance",
    },
    // The Boathouse - Creaking timber, lapping water, rope tension
    boathouse: {
        url: "https://res.cloudinary.com/dptqxjhb8/video/upload/v1735258400/maritime_drone_40hz_pl3x7q.mp3",
        description: "Creaking timber, lapping water, maritime ambience",
    },
    // The Kitchen - Utility sounds, stainless steel, ventilation
    kitchen: {
        url: "https://res.cloudinary.com/dptqxjhb8/video/upload/v1735258400/culinary_hum_40hz_rt5y9w.mp3",
        description: "Kitchen ambient, ventilation hum, culinary warmth",
    },
    // The Orangery - Nature, glass, botanicals
    orangery: {
        url: "https://res.cloudinary.com/dptqxjhb8/video/upload/v1735258400/botanical_breath_40hz_nv2z4e.mp3",
        description: "Botanical greenhouse, glass resonance, nature sounds",
    },
};

/**
 * Seed ambient audio URLs to all scenes based on their domain
 */
export const seedAmbientAudio = mutation({
    args: {},
    handler: async (ctx) => {
        console.log("═══════════════════════════════════════════════════════════════");
        console.log("[AUDIO SOVEREIGN] Seeding room soundscapes...");
        console.log("═══════════════════════════════════════════════════════════════");

        // Fetch all scenes
        const scenes = await ctx.db.query("scenes").collect();
        console.log(`[AUDIO SOVEREIGN] Found ${scenes.length} scenes to process`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const scene of scenes) {
            const domain = scene.domain as string;
            const soundscape = ROOM_SOUNDSCAPES[domain];

            if (soundscape) {
                // Update if no audio URL or if we want to override
                if (!scene.ambientAudioUrl || scene.ambientAudioUrl !== soundscape.url) {
                    await ctx.db.patch(scene._id, {
                        ambientAudioUrl: soundscape.url,
                    });
                    updatedCount++;
                    console.log(`[AUDIO SOVEREIGN] ✓ Updated: ${scene.title} (${domain}) → ${soundscape.description}`);
                } else {
                    skippedCount++;
                    console.log(`[AUDIO SOVEREIGN] ○ Skipped: ${scene.title} (already configured)`);
                }
            } else {
                skippedCount++;
                console.log(`[AUDIO SOVEREIGN] ○ Skipped: ${scene.title} (no soundscape defined for ${domain})`);
            }
        }

        console.log("═══════════════════════════════════════════════════════════════");
        console.log(`[AUDIO SOVEREIGN] COMPLETE`);
        console.log(`  ✓ Updated: ${updatedCount} scenes`);
        console.log(`  ○ Skipped: ${skippedCount} scenes`);
        console.log("═══════════════════════════════════════════════════════════════");

        return {
            success: true,
            updatedCount,
            skippedCount,
            message: `Audio seeding complete. ${updatedCount} scenes now have ambient soundscapes.`,
        };
    },
});
