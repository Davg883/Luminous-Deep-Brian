import { CopilotRuntime, GoogleGenerativeAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
   // Manual initialization for robustness
   const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

   // Reverting to Gemini 3 Flash Preview for Vision Capabilties
   // User Directive: "gemini-3-flash-preview"
   const model = genAI.getGenerativeModel({
      model: "models/gemini-3-flash-preview"
   });

   const serviceAdapter = new GoogleGenerativeAIAdapter({ model: model as any });

   const runtime = new CopilotRuntime();

   const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: "/api/copilotkit",
   });

   return handleRequest(req);
};
