import { internalQuery } from "./_generated/server";

export const listAllSceneSlugs = internalQuery({
    args: {},
    handler: async (ctx) => {
        const scenes = await ctx.db.query("scenes").collect();
        return scenes.map(s => ({
            id: s._id,
            slug: s.slug,
            title: s.title
        }));
    },
});
