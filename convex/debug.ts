import { internalMutation } from "./_generated/server";

export const fixStatusCasing = internalMutation({
    args: {},
    handler: async (ctx) => {
        const reveals = await ctx.db.query("reveals").collect();
        let fixed = 0;
        for (const reveal of reveals) {
            if ((reveal as any).status === "Published") {
                await ctx.db.patch(reveal._id, { status: "published" });
                fixed++;
            }
        }
        return `Processed ${reveals.length} reveals. Fixed ${fixed} casing issues.`;
    }
});
