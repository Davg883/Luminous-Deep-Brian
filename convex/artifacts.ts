import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * The Infinite Archive — Brian's Long-Term Memory
 * 
 * This module provides database-driven lore retrieval. Visual keywords
 * detected by the Vision Pipeline are matched against artifact keywords.
 * 
 * Scale: Add 10,000 artifacts via the Dashboard without redeploying.
 */

// ═══════════════════════════════════════════════════════════════
// SEARCH TOOLS — Client Tools call these to fetch content
// ═══════════════════════════════════════════════════════════════

/**
 * Search the archive by keyword (exact match against keywords array)
 */
export const searchByKeyword = query({
    args: { keyword: v.string() },
    handler: async (ctx, args) => {
        const keyword = args.keyword.toLowerCase();

        // Get all artifacts and filter by keyword match
        const all = await ctx.db.query("artifacts").collect();

        const match = all.find(artifact =>
            artifact.keywords.some(k =>
                k.toLowerCase().includes(keyword) ||
                keyword.includes(k.toLowerCase())
            )
        );

        return match || null;
    },
});

/**
 * Full-text search the archive content
 */
export const searchContent = query({
    args: { searchTerm: v.string() },
    handler: async (ctx, args) => {
        const results = await ctx.db
            .query("artifacts")
            .withSearchIndex("search_content", (q) =>
                q.search("content", args.searchTerm)
            )
            .take(1);

        return results[0] || null;
    },
});

/**
 * Retrieve a full story by its unique slug
 * Brian uses this when asked for "Transmission 001" etc.
 */
export const getStoryBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("stories")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});

/**
 * Retrieve specific artifact by keyword helper
 */
export const getArtifactByKeyword = query({
    args: { keyword: v.string() },
    handler: async (ctx, args) => {
        const results = await ctx.db.query("artifacts").collect();
        return results.find(a => a.keywords.includes(args.keyword)) || null;
    },
});

/**
 * Get all artifacts (for admin/studio view)
 */
export const listAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("artifacts").collect();
    },
});

// ═══════════════════════════════════════════════════════════════
// MUTATIONS — Add/Update artifacts
// ═══════════════════════════════════════════════════════════════

export const createArtifact = mutation({
    args: {
        title: v.string(),
        content: v.string(),
        type: v.union(v.literal("Myth"), v.literal("Signal"), v.literal("Reflection"), v.literal("Visual")),
        keywords: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("artifacts", {
            title: args.title,
            content: args.content,
            type: args.type,
            keywords: args.keywords.map(k => k.toLowerCase()),
            createdAt: Date.now(),
        });
    },
});

export const autoArchive = mutation({
    args: {
        title: v.string(),
        url: v.string(),
        type: v.union(v.literal("Visual"), v.literal("Signal"), v.literal("Reflection"), v.literal("Myth")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const createdBy = identity?.subject || "guest";
        return await ctx.db.insert("artifacts", {
            title: args.title,
            content: args.url,
            type: args.type,
            keywords: ["generated", "visual", "brian"],
            createdAt: Date.now(),
            createdBy,
        });
    },
});

// ═══════════════════════════════════════════════════════════════
// SEED FUNCTION — Populate initial archive (run once)
// ═══════════════════════════════════════════════════════════════

export const seedArchive = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Check if already seeded
        const existing = await ctx.db.query("artifacts").first();
        if (existing) {
            console.log("[Artifacts] Archive already seeded, skipping.");
            return { status: "already_seeded" };
        }

        const artifacts = [
            {
                title: "THE SOLENT STRAIT",
                content: "The treacherous waters separating the Isle of Wight from the mainland. In 1545, the Mary Rose sank here in view of King Henry VIII. The locals speak of the 'Fortibus Fleet' — a flotilla of medieval vessels that never made port. On certain tides, fishermen claim to see their masts breaking the surface.",
                type: "Myth" as const,
                keywords: ["solent", "map", "water", "sea", "ship", "nautical", "strait", "maritime"],
            },
            {
                title: "CARTOGRAPHER'S NOTE",
                content: "This chart dates from the 13th Century, before the great storm of 1287 reshaped the coastline. Note the variance near Brading Haven — now silted and lost. The Keeper marked safe passages with brass pins, most of which have been removed. One remains.",
                type: "Reflection" as const,
                keywords: ["map", "chart", "cartography", "coastline", "haven", "brading"],
            },
            {
                title: "THE FORTIBUS COIN",
                content: "A silver groat bearing the mark of Edward I, dated 1293. Found near Quarr Abbey by a mudlarker in 1987. The inscription reads 'CIVITAS PORTSMUE' — the City of Portsmouth. It should not exist. No such mint operated that year.",
                type: "Signal" as const,
                keywords: ["coin", "silver", "groat", "edward", "quarr", "portsmouth", "mint"],
            },
            {
                title: "STRUCTURAL SURVEY",
                content: "Engineering drawings from 1923, when the lighthouse was retrofitted for the new Fresnel lens. The original foundations are marked as 'UNSTABLE — DO NOT EXCAVATE.' Someone has pencilled 'Why?' in the margin.",
                type: "Reflection" as const,
                keywords: ["blueprint", "drawing", "engineering", "lighthouse", "fresnel", "foundation"],
            },
            {
                title: "ST. CATHERINE'S LIGHT",
                content: "The oratory on St. Catherine's Down has guided sailors since 1323. After the wreck of the Clarendon in 1836, Parliament demanded a proper lighthouse. The current structure houses a secret: a room that appears on no blueprint, accessible only at low tide.",
                type: "Myth" as const,
                keywords: ["lighthouse", "catherine", "oratory", "sailors", "clarendon", "down"],
            },
            {
                title: "THE BRASS ORRERY",
                content: "This armillary sphere was commissioned by Sir Robert Holmes, Governor of the Isle of Wight, in 1672. The planetary positions are set to a date that has not yet occurred. The Keeper believes it shows the night the island will finally drift free.",
                type: "Signal" as const,
                keywords: ["armillary", "orrery", "sphere", "brass", "planet", "holmes", "governor"],
            },
            {
                title: "BS-1363 CIRCUITRY",
                content: "Standard UK power infrastructure. Known for robustness, but the Bunker's wiring dates back to the 1970s. Voltage spikes are common. The emergency generator has not been tested since 2019.",
                type: "Signal" as const,
                keywords: ["plug", "socket", "power", "electric", "tech", "cable", "outlet", "wire"],
            },
            {
                title: "THE KEEPER'S JOURNAL",
                content: "Found beneath the floorboards of the lighthouse cottage. Entries span 1891-1893. The final page contains only one word, repeated forty-seven times: 'APPROACHING.'",
                type: "Myth" as const,
                keywords: ["journal", "book", "notebook", "diary", "pen", "writing", "keeper"],
            },
        ];

        for (const artifact of artifacts) {
            await ctx.db.insert("artifacts", {
                ...artifact,
                createdAt: Date.now(),
            });
        }

        console.log(`[Artifacts] Seeded ${artifacts.length} artifacts to the archive.`);
        return { status: "seeded", count: artifacts.length };
    },
});

// ═══════════════════════════════════════════════════════════════
// NEW SEEDER — Populates the Deep Lore for Isabella & The Wall
// ═══════════════════════════════════════════════════════════════
export const seedSanctuaryLore = mutation({
    args: {},
    handler: async (ctx) => {
        const entries = [
            {
                title: "ISABELLA DE FORTIBUS",
                content: "The 13th-century 'Queen of the Wight.' She resisted the Crown for decades. Legends say she hid a Sovereign Intelligence—a primitive mechanical core—somewhere beneath Seaview before the island was 'sold'.",
                type: "Myth" as const,
                keywords: ["isabella", "queen", "history", "fortibus", "wight"]
            },
            {
                title: "THE SATURATED SEA WALL",
                content: "A perimeter of ancient stone in Seaview that acts as a physical archive. It absorbs data from the deep. When the tide is low, it vibrates with the heat of a thousand processed thoughts.",
                type: "Reflection" as const, // Mapped 'Technical' to 'Reflection' to match schema
                keywords: ["wall", "sea wall", "discovery", "stone", "saturated"]
            },
            {
                title: "THE FORTIBUS FLEET",
                content: "A lost flotilla of ships that never made port. They weren't carrying gold; they were carrying the 'Bones of the Deep'—the original server architecture for the Sanctuary.",
                type: "Signal" as const,
                keywords: ["fleet", "ships", "discovery", "maritime", "fortibus"]
            }
        ];

        let count = 0;
        for (const entry of entries) {
            // Check for duplicates before inserting
            const existing = await ctx.db
                .query("artifacts")
                .filter(q => q.eq(q.field("title"), entry.title))
                .first();

            if (!existing) {
                await ctx.db.insert("artifacts", entry);
                count++;
            }
        }
        return `Sanctuary Seeded. Added ${count} new artifacts.`;
    },
});
