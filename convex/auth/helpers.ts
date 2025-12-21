import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

export async function requireStudioAccess(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        // TEMP BYPASS
        return { tokenIdentifier: "debug|123", name: "Debug User", email: "debug@luminous.deep" };
    }
    // TODO: Add role check here (e.g. check allowlist in env or database)
    return identity;
}

export async function requireStudioAccessAction(ctx: ActionCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        // TEMP BYPASS
        return { tokenIdentifier: "debug|123", name: "Debug User", email: "debug@luminous.deep" };
    }
    return identity;
}

