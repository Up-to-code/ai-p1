import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Migration script for organization-level spaces
 * 
 * This is a placeholder for future data migration needs.
 * Since the projectSpaces table has already been cleaned up to be a proper junction table,
 * there is no old project-specific space data to migrate from.
 * 
 * This migration can be used in the future if we need to:
 * - Migrate data from a different source
 * - Update existing space data structure
 * - Bulk update space permissions or visibility
 * 
 * Run this via: npx convex run migrations:migrateToOrganizationSpaces
 */

export const migrateToOrganizationSpaces = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? false;
    
    console.log("Migration to organization-level spaces...");
    console.log(`Dry run: ${dryRun}`);
    
    // Get current organization-level spaces
    const spaces = await ctx.db
      .query("spaces")
      .collect();
    
    console.log(`Found ${spaces.length} organization-level spaces`);
    
    // Get current projectSpaces junction entries
    const projectSpaces = await ctx.db
      .query("projectSpaces")
      .collect();
    
    console.log(`Found ${projectSpaces.length} project-space junction entries`);
    
    // This is a no-op migration since the schema is already in the desired state
    // Future migrations can be added here as needed
    
    console.log("Migration completed (no-op - schema already up to date)");
    
    return {
      spacesCount: spaces.length,
      junctionCount: projectSpaces.length,
      dryRun,
    };
  },
});
