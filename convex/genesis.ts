"use node";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * GENESIS PROTOCOL — The "Magic Ingest" Pipeline
 * 
 * Feed raw text -> Get structured database entries.
 * This tool uses Gemini to parse manuscripts into Stories and Artifacts.
 * 
 * NOTE: This file uses "use node" for proper Node.js fetch/runtime support.
 * Database mutations are handled in 'genesis_db.ts'.
 */

// 1. THE AI PARSER (Breaks raw text into DB rows)
export const ingestRawContent = action({
    args: { rawText: v.string(), tier: v.string() },
    handler: async (ctx, args) => {
        try {
            const apiKey = process.env.GOOGLE_API_KEY;
            if (!apiKey) {
                console.error("GOOGLE_API_KEY is missing in Convex environment variables.");
                return { status: "error", message: "Configuration Error: GOOGLE_API_KEY is not set in Convex Dashboard." };
            }

            // Ask Gemini to structure the data with zero-shot parsing
            const prompt = `
      Analyze this raw narrative text from "The Luminous Deep".
      It is a sci-fi mystery set in a flooded bunker/lighthouse.
      
      Tasks:
      1. Extract the Title and Main Story Content (formatted as Markdown).
      2. Identify the Narrative Voice (Thea Lux = Poetic/Memory, Julian = Technical/Cold, Cassie = Chaos/Glitch).
      3. Assign it to a Room based on context (study, control_room, workshop, kitchen, boathouse, lounge).
      4. Extract exactly 3 "Artifacts" (Physical objects mentioned in the text) that will be used for lore cards.
         - Keywords should be single words related to the object (e.g. "map", "key", "circuit").
         - Content for artifacts should be a short, cryptic description (1-2 sentences).
      
      Output STRICT valid JSON only:
      {
        "story": { 
          "title": "...", 
          "slug": "...", 
          "content": "...", 
          "author": "...", 
          "roomId": "..." 
        },
        "artifacts": [
          { "keywords": ["key", "word"], "title": "...", "content": "...", "type": "Signal" }
        ]
      }
      
      RAW TEXT:
      ${args.rawText}
    `;

            console.log("[Genesis] Parsing raw content...");

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" } // Force JSON mode
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Gemini API Error: ${response.status} ${errorText}`);
                return { status: "error", message: `Gemini API Error (${response.status}): ${errorText.substring(0, 100)}` };
            }

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) {
                return { status: "error", message: "Empty response from Gemini AI." };
            }

            const json = JSON.parse(textResponse);
            console.log("[Genesis] Extracted:", json.story?.title);

            // SANITIZATION: Ensure strict schema compliance
            const safeStory = {
                title: json.story?.title || "Untitled Transmission",
                slug: json.story?.slug, // Optional
                content: json.story?.content || json.story?.body || json.story?.description || "Content corrupted during transmission.",
                author: json.story?.author,
                roomId: json.story?.roomId,
                tier: args.tier
            };

            const safeArtifacts = (json.artifacts || []).map((art: any) => ({
                keywords: Array.isArray(art.keywords) ? art.keywords : ["unknown"],
                title: art.title || "Unknown Artifact",
                content: art.content || art.description || "Analysis pending.",
                type: art.type || "Signal"
            }));

            // Save to Convex via internal mutation
            await ctx.runMutation(internal.genesis_db.saveContent, {
                story: safeStory,
                artifacts: safeArtifacts
            });

            return { status: "success", title: safeStory.title };

        } catch (e: any) {
            console.error("[Genesis] Critical Failure:", e);
            return { status: "error", message: `System Error: ${e.message || "Unknown Failure"}` };
        }
    }
});
