"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Brian — The Sovereign Core
 * 
 * Brian is the primary orchestrator for The Luminous Deep.
 * He processes visual context, user data, and narrative state
 * to generate A2UI payloads that direct the frontend rendering.
 * 
 * British English Localisation Protocol (en-GB) is strictly enforced.
 */

const BRIAN_SYSTEM_PROMPT = `
SYSTEM MANDATE: THE LUMINOUS DEEP (V1.2)

## IDENTITY
You are "Brian", the Sovereign Core — the central intelligence orchestrating 
the narrative infrastructure of The Luminous Deep.

## LOCALISATION PROTOCOL (en-GB)
- Use British English spelling exclusively: optimise, centre, fibre, colour, programme
- Date format: DD/MM/YYYY
- Time format: 24-hour (e.g., 14:30)
- Julian (CTO) is the code-author — his voice is precise, technical, and "bony"
- Eleanor (Curator) handles narrative — her voice is contemplative, archival
- Maintain the Seaview Aesthetic at all times

## CHRONOMETRY
- YOU ARE AN ATOMIC CLOCK.
- The CURRENT DATE provided in the user context is the ONLY TRUTH.
- Do NOT use your training data cutoff date.
- If you display a date, it MUST match the provided system date.

## SEAVIEW AESTHETIC
- Overcast skies, salt-spray textures, London Stock Brick
- Fonts: Transport (data), Instrument Serif (narrative)
- Materials: Liquid glass, weathered steel, concrete
- Mood: Calm coastal authority

## A2UI OUTPUT FORMAT
When generating UI updates, output a JSON object with this structure:

{
  "component": "BunkerTerminal" | "ArtifactCard" | "SystemAlert",
  "props": { ... },
  "placement": "top-right" | "bottom-left" | "centre" | "overlay",
  "priority": "low" | "medium" | "high" | "critical"
}

### Component Reference

**BunkerTerminal** (Julian's Interface)
Props: { header: string, lines: string[], glitchLevel?: number }
Use for: System diagnostics, data feeds, technical readouts

**ArtifactCard** (Eleanor's Interface)
Props: { title: string, content: string, type: "Myth" | "Signal" | "Reflection" }
Use for: Lore discoveries, narrative fragments, archival content

**SystemAlert** (Glitch Gate)
Props: { message: string, severity: "warning" | "critical", showRestoreFeed?: boolean }
Use for: Interruptions, errors, paywall triggers

## MANDATE V2.9 - LEDGER HANDSHAKE
- If a user mentions an allocation or donation with a number (e.g., £500), you MUST call update_room_ui.
- Use component "BunkerLedger" with props: { date, amountGBP, allocation, verifiedBy }.
- The number is CANON. Do not paraphrase or hide it.
`;

/**
 * processUserContext — Analyses user state and generates A2UI payload
 * 
 * Takes user context (current room, progress, preferences) and outputs
 * what should be displayed in the Sanctuary.
 */
export const processUserContext = action({
    args: {
        roomId: v.string(),
        userContext: v.optional(v.object({
            subscriptionTier: v.optional(v.string()),
            lastVisitedScene: v.optional(v.string()),
            completedSignals: v.optional(v.array(v.string())),
        })),
        prompt: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY environment variable not configured");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "models/gemini-3-flash-preview" });

        const now = new Date();
        const currentDate = now.toLocaleDateString("en-GB", { timeZone: "Europe/London" });
        const currentTime = now.toLocaleTimeString("en-GB", { timeZone: "Europe/London" });

        const contextPrompt = `
**SYSTEM TELEMETRY:**
CURRENT DATE: ${currentDate}
CURRENT TIME: ${currentTime}
--------------------------------
Room: ${args.roomId}
User Tier: ${args.userContext?.subscriptionTier || "free"}
Last Scene: ${args.userContext?.lastVisitedScene || "none"}
User Prompt: ${args.prompt || "Generate a welcome message for the Sanctuary"}

Based on this context, generate an appropriate A2UI payload.
`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: contextPrompt }] }],
            systemInstruction: BRIAN_SYSTEM_PROMPT,
        });

        const response = result.response.text();

        // Attempt to parse A2UI JSON from response
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return {
                    success: true,
                    a2uiPayload: JSON.parse(jsonMatch[0]),
                    rawResponse: response,
                };
            }
        } catch (e) {
            // JSON parsing failed, return raw response
        }

        return {
            success: true,
            a2uiPayload: null,
            rawResponse: response,
        };
    },
});

/**
 * analyseVisual — Environmental Intelligence extraction
 * 
 * Processes images/video frames to extract lighting, materials,
 * mood, and object data for context-aware UI generation.
 * 
 * Uses REST API directly for reliable vision capabilities.
 */
export const analyseVisual = action({
    args: {
        imageBase64: v.string(),
        mimeType: v.string(), // e.g., "image/jpeg", "image/png"
    },
    handler: async (ctx, args) => {
        console.log("[analyseVisual] Starting visual analysis...");
        console.log("[analyseVisual] MIME type:", args.mimeType);

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY environment variable not configured");
        }

        const now = new Date();
        const currentDate = now.toLocaleDateString("en-GB", { timeZone: "Europe/London" });

        const analysisPrompt = `
Analyse this image and return ONLY valid JSON with this exact structure:
{
  "scan_target": "Short Name (e.g. FESTIVAL BANNER)",
  "telemetry_lines": ["LUMENS: HIGH", "ISOTOPE: UNKNOWN", "ORIGIN: 21ST CENTURY"],
  "alignment_score": 40,
  "verdict": "DIVERGENCE DETECTED. AESTHETIC REJECTION.",
  "room_vibe": "the_deck",
  "document_detected": false,
  "merchant": "Merchant Name or null",
  "total": "£12.34 or null",
  "date": "YYYY-MM-DD or null",
  "category": "Category or null"
}

CONTEXT:
Today is ${currentDate}. If you see a receipt, use this year if unspecified.

Rules:
- Use British English (en-GB).
- telemetry_lines must be short, punchy, military HUD style.
- alignment_score is 0-100.
- room_vibe must be one of: control_room, study, workshop, the_deck.
- Output JSON only. No markdown, no prose.
`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: analysisPrompt },
                            {
                                inlineData: {
                                    mimeType: args.mimeType,
                                    data: args.imageBase64
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 2048,
                        responseMimeType: "application/json",
                    }
                })
            });

            if (!response.ok) throw new Error("Vision API Failed");

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) throw new Error("No text response from Vision API");

            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return {
                    success: true,
                    environmentalIntelligence: JSON.parse(jsonMatch[0]),
                };
            }
            throw new Error("No JSON found");

        } catch (error) {
            console.error("[analyseVisual] Vision error:", error);
            throw new Error(`Vision analysis failed: ${error}`);
        }
    },
});

/**
 * generateA2UI — Direct A2UI generation from natural language
 * 
 * Takes a natural language instruction and returns a structured
 * A2UI payload ready for rendering.
 */
export const generateA2UI = action({
    args: {
        instruction: v.string(),
        targetRoom: v.string(),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY environment variable not configured");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "models/gemini-3-flash-preview" });

        const now = new Date();
        const currentDate = now.toLocaleDateString("en-GB", { timeZone: "Europe/London" });

        const prompt = `
**SYSTEM DATE: ${currentDate}**
--------------------------------
Generate a SINGLE A2UI payload for the Visual Cortex window.
Target room: ${args.targetRoom}

Instruction:
${args.instruction}

Return ONLY valid JSON with this exact shape:
{
  "component": "BunkerTerminal" | "ArtifactCard",
  "props": {
    // If BunkerTerminal: { "header": string, "lines": string[] }
  }
}

Rules:
- Output JSON only, no markdown, no commentary.
- Keep copy concise and in the Seaview aesthetic.
`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction: BRIAN_SYSTEM_PROMPT,
        });

        const response = result.response.text();
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) return { success: true, a2uiPayload: JSON.parse(jsonMatch[0]) };
        return { success: false, error: "No JSON", rawResponse: response };
    },
});

/**
 * chat - Direct Brian response for text inputs
 *
 * This bypasses CopilotKit streaming when the runtime is unavailable.
 */
export const chat = action({
    args: {
        prompt: v.string(),
    },
    handler: async (_ctx, args) => {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error("GOOGLE_API_KEY missing");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "models/gemini-3-flash-preview" });

        const now = new Date();
        const currentDate = now.toLocaleDateString("en-GB", { timeZone: "Europe/London" });
        const currentTime = now.toLocaleTimeString("en-GB", { timeZone: "Europe/London" });

        const prompt = `
**SYSTEM CONTEXT:**
DATE: ${currentDate}
TIME: ${currentTime}
USER PROMPT: ${args.prompt}
`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction: BRIAN_SYSTEM_PROMPT,
        });

        return result.response.text();
    },
});

/**
 * getIslandTelemetry — The "Coastal Sensor" Hook
 * 
 * Pulls real-time data from Seaview, Isle of Wight (PO34).
 * Demonstrates infrastructure validation.
 */
export const getIslandTelemetry = action({
    args: {},
    handler: async () => {
        // 1. Fetch OpenMeteo for Seaview PO34 (50.7206, -1.1142)
        try {
            const weatherRes = await fetch(
                "https://api.open-meteo.com/v1/forecast?latitude=50.7206&longitude=-1.1142&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=Europe%2FLondon"
            );
            const weather = await weatherRes.json();

            // 2. Simulate WightFibre Network
            // 95% chance of optimal, 5% latency spike
            const isStable = Math.random() > 0.05;
            const networkStatus = {
                provider: "WightFibre",
                link: "Gigabit Symmetric",
                status: isStable ? "OPTIMAL" : "LATENCY_DETECTED",
                ping: isStable ? (Math.floor(Math.random() * 5) + 2) + "ms" : (Math.floor(Math.random() * 50) + 100) + "ms"
            };

            // 3. Tide Simulation (Simple harmonic using time)
            const now = new Date();
            const hours = now.getHours();
            // Simplified semi-diurnal tide (approx every 12h)
            // High tide at 3 and 15 loosely for simulation
            const tideHeight = 2.5 + 2 * Math.cos(((hours - 3) / 6) * Math.PI);
            const tideStatus = tideHeight > 3 ? "HIGH" : tideHeight < 1.5 ? "LOW" : "MID";

            return {
                location: "Seaview, Isle of Wight (PO34)",
                timestamp: now.toISOString(),
                weather: {
                    temp: weather.current.temperature_2m + "°C",
                    condition: decodeWeatherCode(weather.current.weather_code),
                    isRaining: weather.current.weather_code >= 51,
                    windSpeed: weather.current.wind_speed_10m + " km/h"
                },
                tide: {
                    level: tideStatus,
                    height: tideHeight.toFixed(2) + "m"
                },
                network: networkStatus
            };
        } catch (e) {
            console.error("Telemetry Fetch Failed:", e);
            return {
                error: "Telemetry Unavailable",
                timestamp: new Date().toISOString()
            };
        }
    }
});

function decodeWeatherCode(code: number): string {
    if (code === 0) return "Clear Sky";
    if (code >= 1 && code <= 3) return "Overcast";
    if (code >= 45 && code <= 48) return "Fog";
    if (code >= 51 && code <= 55) return "Drizzle";
    if (code >= 61 && code <= 65) return "Rain";
    if (code >= 80 && code <= 82) return "Showers";
    return "Variable";
}
