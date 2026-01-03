import { CopilotRuntime, GoogleGenerativeAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
   // Manual initialization for robustness (Next.js 15/16 compat)
   // Ensure GOOGLE_API_KEY is present in .env.local
   const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

   // Using gemini-2.0-flash-exp for high speed and A2UI JSON capabilities
   // This model is the current "Brain" of the Sanctuary
   const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp"
   });

   // Cast model as any if type mismatch occurs with Adapter
   const serviceAdapter = new GoogleGenerativeAIAdapter({ model: model as any });

   const runtime = new CopilotRuntime();

   const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: "/api/copilotkit",
   });

   return handleRequest(req);
};
