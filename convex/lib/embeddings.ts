
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const fetchEmbedding = internalAction({
    args: { text: v.string() },
    handler: async (ctx, args) => {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(args.text);

        // Gemini returns values object which contains embedding array
        return result.embedding.values;
    }
});
