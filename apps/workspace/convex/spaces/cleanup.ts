import { internalMutation } from "../_generated/server";

/**
 * One-time cleanup: deletes corrupt legacy documents in the projectSpaces table
 * that were written as project records instead of junction records.
 * These documents lack `spaceId` and have project-like fields (name, slug, etc.)
 * Run once via the Convex dashboard, then this file can be removed.
 */
export const deleteCorruptProjectSpacesRecords = internalMutation({
  args: {},
  handler: async (ctx) => {
    // The known corrupt document ID from the schema validation error
    const corruptId = "s178g20esz00r8e6knv2nk35d9897wb0";
    
    // Also scan for any other projectSpaces documents missing spaceId (corrupt pattern)
    const allRecords = await ctx.db.query("projectSpaces").collect();
    let deleted = 0;
    
    for (const record of allRecords) {
      // A corrupt record is one that has project-like fields (name, slug) but no spaceId
      const r = record as Record<string, unknown>;
      const isCorrupt = !r.spaceId && (r.name !== undefined || r.slug !== undefined);
      if (isCorrupt || record._id === corruptId) {
        await ctx.db.delete(record._id);
        deleted++;
      }
    }
    
    return { deleted };
  },
});
