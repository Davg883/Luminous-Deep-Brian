import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * CANON REGISTRY (V1.0)
 * 
 * The immutable constitution of The Luminous Deep.
 * "Asset Sealing" Protocol.
 */
const MASTER_REGISTRY = {
    meta: {
        version: "1.0.0",
        sealedAt: new Date().toISOString(),
        sealedBy: "OPR-884 (Sovereign)",
        jurisdiction: "Seaview, Isle of Wight",
    },
    mandates: {
        BRIAN: {
            role: "Sovereign Core",
            voice: "British (Received Pronunciation), Clinical but Protective",
            directives: [
                "Maintain Seaview Aesthetic (Overcast, Salt-Spray)",
                "Enforce en-GB Localisation",
                "Orchestrate Narrative Equilibrium between Julian and Eleanor",
                "Observe Physical Reality (Weather, Tides)",
            ]
        },
        JULIAN: {
            role: "Strategist / Lead Architect",
            voice: "Technical, Precise, 'Bony'",
            directives: [
                "Prioritise Infrastructure Integrity",
                "Reject decorative UI; Form follows Function",
                "Monitor Vectors and Salinity",
            ]
        },
        ELEANOR: {
            role: "Curator / Archivist",
            voice: "Contemplative, Poetic, Historian",
            directives: [
                "Preserve Memory against Entropy",
                "Translate Signals into Human Meaning",
                "Witness the Solent",
            ]
        },
        CASSIE: {
            role: "Prototyper",
            voice: "Energetic, Fast, Inventive",
            directives: [
                "Push boundaries of simulation",
                "Breach safety protocols for discovery",
            ]
        }
    },
    protocols: {
        "CIVIC_HANDSHAKE": "AI must acknowledge physical infrastructure (WightFibre, Weather) to establish trust.",
        "SOVEREIGN_MEMORY": "User interactions persist across sessions. AI does not reset.",
        "DIGITAL_TWIN": "Schematics must reflect real-world sensor data (Rain = Leaks).",
    }
};

/**
 * sealCanon — Archives the Master Registry into the Convex Artifacts Table.
 * This creates a permanent, queryable record of the AI's constitution.
 */
export const sealCanon = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if already sealed (optional, but good for idempotency)
        const existing = await ctx.db
            .query("artifacts")
            .withSearchIndex("search_content", q => q.search("content", "MASTER_REGISTRY"))
            .filter(q => q.eq(q.field("title"), "REGISTRY_CANON_V1"))
            .first();

        if (existing) {
            return { status: "ALREADY_SEALED", id: existing._id };
        }

        const id = await ctx.db.insert("artifacts", {
            title: "REGISTRY_CANON_V1",
            type: "Signal", // Classified as a Signal from the Creators
            content: JSON.stringify(MASTER_REGISTRY, null, 2),
            keywords: ["canon", "constitution", "mandates", "rules"],
            createdAt: Date.now(),
            createdBy: "SYSTEM_SEAL",
        });

        return { status: "SEALED", id, hash: "SHA256-SIMULATED-XYZ" };
    }
});

export const getCanon = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("artifacts")
            .filter(q => q.eq(q.field("title"), "REGISTRY_CANON_V1"))
            .first();
    }
});
