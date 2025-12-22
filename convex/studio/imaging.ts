
import { v } from "convex/values";
import { action } from "../_generated/server";
import { requireStudioAccessAction } from "../auth/helpers";

// ═══════════════════════════════════════════════════════════════
// THE DARKROOM - Agent Image Generation Pipeline
// Uses Google's Imagen API via Gemini SDK to generate images
// and uploads them to Cloudinary for permanent storage.
// ═══════════════════════════════════════════════════════════════

// Style modifiers per agent voice
const AGENT_STYLES: Record<string, string> = {
    eleanor: "Soft focus, film grain, vintage polaroid aesthetic, warm golden light, dust motes floating in air, sepia undertones, nostalgic atmosphere",
    julian: "Technical diagram style, blueprint aesthetic, cyanotype colors, sharp precise lines, nautical instruments, cool blue tones, engineering precision",
    cassie: "Macro photography, high contrast, workshop clutter, shallow depth of field, sawdust particles visible, warm tungsten light, creative chaos"
};

export const generateAgentImage = action({
    args: {
        prompt: v.string(),
        agentVoice: v.union(v.literal("cassie"), v.literal("eleanor"), v.literal("julian")),
        sceneSlug: v.string(),
    },
    handler: async (ctx, args) => {
        await requireStudioAccessAction(ctx);

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("Missing GOOGLE_API_KEY environment variable");
        }

        // Construct the full prompt with agent style
        const styleModifier = AGENT_STYLES[args.agentVoice] || "";
        const fullPrompt = `${args.prompt}. Style: ${styleModifier}`;

        console.log("[DARKROOM] Generating image for:", args.agentVoice);
        console.log("[DARKROOM] Prompt:", fullPrompt.substring(0, 200) + "...");

        try {
            // Note: As of late 2025, Imagen 3 via Gemini API uses a different endpoint
            // We'll use the REST API directly for image generation
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    instances: [{ prompt: fullPrompt }],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: "16:9",
                        safetyFilterLevel: "BLOCK_MEDIUM_AND_ABOVE",
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("[DARKROOM] Imagen API Error:", errorText);

                // Fallback: Return a placeholder message if Imagen isn't available
                if (response.status === 404 || response.status === 400) {
                    throw new Error("Image generation is not available. The Imagen API may require additional setup or billing.");
                }
                throw new Error(`Imagen API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            // Extract base64 image from response
            const imageBase64 = data.predictions?.[0]?.bytesBase64Encoded;
            if (!imageBase64) {
                throw new Error("No image data returned from Imagen API");
            }

            console.log("[DARKROOM] Image generated, uploading to Cloudinary...");

            // Upload to Cloudinary
            const cloudinaryCloud = process.env.CLOUDINARY_CLOUD_NAME;
            const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
            const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

            if (!cloudinaryCloud || !cloudinaryApiKey || !cloudinaryApiSecret) {
                throw new Error("Missing Cloudinary credentials");
            }

            // Create upload signature
            const timestamp = Math.floor(Date.now() / 1000);
            const folder = "Luminous Deep/Generated";
            const tags = `${args.agentVoice},${args.sceneSlug},ai-generated`;

            // For Cloudinary unsigned upload, we'll use the upload preset approach
            // Or signed upload with timestamp
            const crypto = await import("crypto");
            const signatureString = `folder=${folder}&tags=${tags}&timestamp=${timestamp}${cloudinaryApiSecret}`;
            const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

            const formData = new FormData();
            formData.append("file", `data:image/png;base64,${imageBase64}`);
            formData.append("api_key", cloudinaryApiKey);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("folder", folder);
            formData.append("tags", tags);

            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloud}/image/upload`, {
                method: "POST",
                body: formData
            });

            if (!uploadResponse.ok) {
                const uploadError = await uploadResponse.text();
                console.error("[DARKROOM] Cloudinary Upload Error:", uploadError);
                throw new Error(`Cloudinary upload failed: ${uploadError}`);
            }

            const uploadResult = await uploadResponse.json();
            const secureUrl = uploadResult.secure_url;

            console.log("[DARKROOM] Success! Image URL:", secureUrl);
            return secureUrl;

        } catch (e: any) {
            console.error("[DARKROOM] Error:", e.message || e);
            throw new Error(`Image generation failed: ${e.message || e}`);
        }
    }
});

// Alternative action that generates a placeholder when Imagen isn't available
export const getPlaceholderImage = action({
    args: {
        prompt: v.string(),
        agentVoice: v.string(),
    },
    handler: async (ctx, args) => {
        // Return a themed placeholder based on agent voice
        const placeholders: Record<string, string> = {
            eleanor: "https://res.cloudinary.com/dptqxjhb8/image/upload/v1/Luminous%20Deep/Placeholders/eleanor-placeholder.jpg",
            julian: "https://res.cloudinary.com/dptqxjhb8/image/upload/v1/Luminous%20Deep/Placeholders/julian-placeholder.jpg",
            cassie: "https://res.cloudinary.com/dptqxjhb8/image/upload/v1/Luminous%20Deep/Placeholders/cassie-placeholder.jpg"
        };

        return placeholders[args.agentVoice] || "https://via.placeholder.com/1920x1080?text=Image+Pending";
    }
});
