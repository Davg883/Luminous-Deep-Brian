import { query } from "../_generated/server";
import { requireStudioAccess } from "../auth/helpers";

export const getAllMedia = query({
    args: {},
    handler: async (ctx) => {
        await requireStudioAccess(ctx);
        return await ctx.db.query("media").order("desc").collect();
    },
});
