import { action } from "../_generated/server";
import { v } from "convex/values";
import { requireStudioAccessAction } from "../auth/helpers";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateContent = action({
    args: {
        prompt: v.string(),
        model: v.optional(v.string()),
        voice: v.optional(v.union(v.literal("cassie"), v.literal("eleanor"), v.literal("julian"))),
    },
    handler: async (ctx, args) => {
        await requireStudioAccessAction(ctx);

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: args.model || "gemini-3-flash-preview",
        });

        // Voice Persona Definitions (kept as is)
        const personas = {
            cassie: `You are Cassie (The Workshop). 
            Tone: Energetic, messy, optimistic, hands-on. 
            Focus: "How it's made", raw materials, sparks, prototypes, "what if?", sketches.
            Style: Use short sentences. Ask questions. Sound like you're in the middle of a project.`,

            eleanor: `You are Eleanor (The Study). 
            Tone: Poetic, slow, observational, deep, nostalgic. 
            Focus: "How it felt", memories, light, dust, books, time preservation, shadows.
            Style: Lyrical, flowing sentences. Use sensory metaphors (smell, touch).`,

            julian: `You are Julian (The Boathouse). 
            Tone: Ultra-technical, dry, analytical, detached, precise. 
            Focus: Systems, physics, hydrodynamics, vectors, "the mechanism", cause and effect. 
            Style: Use scientific jargon properly. Avoid emotion. Describe things as if writing a lab report or engineering log.`
        };

        const personaContext = args.voice ? personas[args.voice] : "You are a creative writer for Luminous Deep.";

        // Detect if input is likely JSON or Raw Text
        const isJson = args.prompt.trim().startsWith("{") || args.prompt.trim().startsWith("[");

        let systemInstruction;

        if (isJson) {
            systemInstruction = `
            INSTRUCTION: You must use a chain-of-thought reasoning process to analyze the character's voice and the narrative context before outputting the final JSON. Ensure the tone matches the owner (Cassie/Eleanor/Julian) perfectly.

            You are the Luminous Deep Narrative Engine powered by Gemini 3.
            Your primary goal is to refine raw story notes into a character's specific voice while maintaining strict JSON integrity.

            VOICE GUIDES:
            - CASSIE: Energetic, process-oriented, focused on 'How it's made'.
            - ELEANOR: Poetic, observant, focused on 'How it feels'.
            - JULIAN: Technical, precise, dry humor, focused on 'How it works'.

            DIRECTIVES:
            1. Output ONLY valid JSON. 
            2. Do not include markdown formatting like \`\`\`json.
            3. Do not change keys. Only update values.
            4. Verify that the hotspot names and hint text are evocative and diegetic.
            5. CRITICAL: Never return "Enter Title" or "Untitled". You MUST generate a poetic, 2-4 word title based on the story fragment (e.g., "The Salt-Soaked Timber").
            `;
        } else {
            systemInstruction = `
            INSTRUCTION: You are a Story Ingest Engine. You are receiving raw notes or a story fragment. You must convert it into a valid Luminous Deep content pack JSON object.

            Identity Context:
            ${personaContext}

            TARGET JSON SCHEMA:
            {
               "hotspot_id": "string (snake_case, derived from title)",
               "scene_slug": "string (infer from content, e.g. 'workshop', 'study', 'boathouse')",
               "title": "string (Creative, avoid 'Untitled')",
               "type": "text",
               "content": "string (formatted markdown, approximately 150 words)",
               "hint": "string (short diegetic hint, e.g. 'Inspect the...')",
               "tags": ["string"],
               "canon_refs": ["string"],
               "media_refs": "string (leave empty string if unknown)",
               "version": 1
            }

            DIRECTIVES:
            1. Output ONLY valid JSON.
            2. Create the JSON based on the raw text provided.
            3. Infer the best fitting character voice and scene if not obvious.
            4. TITLE REQUIREMENT: CRITICAL: You are forbidden from returning the strings 'Enter Title', 'Untitled', or any placeholder. You are a Master Storyteller. If the user provides a fragment, you MUST synthesize a unique, evocative title (e.g., 'The Rustling Panes', '982 Millibars', 'Whispers in the Glass') based on the content.
            5. THINKING PROCESS: Before naming, analyze the scene (Boathouse/Study) to ensure the title vocabulary fits the environment (e.g. Boathouse = Nautical/Scientific, Study = Academic/Nostalgic).
            `;
        }

        const fullPrompt = `${systemInstruction}
        
        Task: ${isJson ? "Refresh the 'content' of the provided JSON content object." : "Convert this text into a JSON content pack."}
        Input: ${args.prompt}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let text = response.text();

        // Aggressive "Fuzzy" JSON Cleaner
        // Finds the first '{' or '[' and the last '}' or ']'
        const firstBrace = text.search(/[\{\[]/);
        const lastBrace = text.search(/[\}\]](?!.*[\}\]])/); // Last occurrence

        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        } else {
            // Fallback for markdown stripping if regex fails
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        return text;
    },
});
