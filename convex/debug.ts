import { internalMutation } from "./_generated/server";

export const wipeAllData = internalMutation({
    args: {},
    handler: async (ctx) => {
        const tables = ["objects", "reveals", "chapters", "scenes", "media", "contentPacks"];

        for (const table of tables) {
            const records = await ctx.db.query(table as any).collect();
            for (const record of records) {
                await ctx.db.delete(record._id);
            }
        }

        return "All data wiped from: " + tables.join(", ");
    },
});
