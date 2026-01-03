import { CopilotRuntime, GoogleGenerativeAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { NextRequest } from "next/server";

const serviceAdapter = new GoogleGenerativeAIAdapter({
   model: "models/gemini-3-flash-preview"
});

// Minimal runtime - no actions to prevent ZodError
const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
   const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: "/api/copilotkit",
   });
   return handleRequest(req);
};
