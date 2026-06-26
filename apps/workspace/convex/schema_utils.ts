/**
 * WHY:   Schema index patterns are repeated across tables and need centralized documentation.
 * WHAT:  Index strategy utilities and documentation for query optimization.
 * HOW:  Provides index builders and documents common patterns for consistency.
 */

/**
 * Common index patterns used across the schema.
 * These patterns ensure consistent query performance and data access patterns.
 */
export const IndexPatterns = {
  /**
   * Primary organization-scoped index for all workspace tables.
   * Pattern: by_organization_id
   * Usage: Fetch all records for an organization (unfiltered, ordered by insertion).
   */
  organizationPrimary: ["organizationId"] as const,

  /**
   * Organization + updated timestamp for reverse-chronological lists.
   * Pattern: by_organization_updated
   * Usage: List views showing most recently updated records first.
   */
  organizationUpdated: ["organizationId", "updatedAt"] as const,

  /**
   * Organization + status field for filtered lists.
   * Pattern: by_organization_status
   * Usage: Filter by status while maintaining organization scope.
   */
  organizationStatus: ["organizationId", "status"] as const,

  /**
   * Organization + type field for typed resources.
   * Pattern: by_organization_type
   * Usage: Filter by resource type (e.g., client type, project type).
   */
  organizationType: ["organizationId", "type"] as const,

  /**
   * Status + timestamp for time-based status queries.
   * Pattern: by_status_updated
   * Usage: Find records by status ordered by update time.
   */
  statusUpdated: ["status", "updatedAt"] as const,

  /**
   * Status + timestamp for time-based creation queries.
   * Pattern: by_status_created
   * Usage: Find records by status ordered by creation time.
   */
  statusCreated: ["status", "createdAt"] as const,

  /**
   * Organization + foreign key for relation queries.
   * Pattern: by_organization_[relation]
   * Usage: Fetch records linked to a specific parent (e.g., tasks by project).
   */
  organizationRelation: (relation: string) => ["organizationId", relation] as const,
} as const;

/**
 * Query optimization guidelines.
 * These help avoid full table scans and ensure efficient queries.
 */
export const QueryOptimization = {
  /**
   * Maximum items to scan for list queries.
   * Above this threshold, consider pagination or additional filters.
   */
  MAX_LIST_SCAN: 300,

  /**
   * Maximum items to scan for search queries.
   * Search requires in-memory filtering, so keep scans smaller.
   */
  MAX_SEARCH_SCAN: 500,

  /**
   * Maximum items to scan for stats queries.
   * Stats aggregate over all records, so this can be higher.
   */
  MAX_STATS_SCAN: 2_000,

  /**
   * Check if a query might scan too many items.
   */
  isScanRisky(count: number, type: "list" | "search" | "stats"): boolean {
    const limits = {
      list: QueryOptimization.MAX_LIST_SCAN,
      search: QueryOptimization.MAX_SEARCH_SCAN,
      stats: QueryOptimization.MAX_STATS_SCAN,
    };
    return count > limits[type];
  },

  /**
   * Suggest pagination strategy based on expected record count.
   */
  suggestPaginationStrategy(expectedCount: number): "cursor" | "offset" | "full" {
    if (expectedCount < 100) return "full";
    if (expectedCount < 1000) return "cursor";
    return "offset";
  },
} as const;

/**
 * Index coverage checker.
 * Helps validate that indexes cover common query patterns.
 */
export function checkIndexCoverage(
  indexes: readonly string[][],
  queryFields: string[],
): { covered: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  for (const field of queryFields) {
    const hasIndex = indexes.some((index) => index.includes(field));
    if (!hasIndex) {
      missingFields.push(field);
    }
  }
  return {
    covered: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Generate index name from fields.
 * Ensures consistent naming across the schema.
 */
export function indexName(fields: readonly string[]): string {
  return `by_${fields.join("_")}`;
}
