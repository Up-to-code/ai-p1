import { ConvexError } from "convex/values";
import { components } from "../_generated/api";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type TeamAccessCtx = Pick<QueryCtx | MutationCtx, "runQuery">;
type AdapterTeam = { id?: string; _id?: string; organizationId?: string; name?: string };
type AdapterTeamMember = { teamId?: string; userId?: string };
type AdapterPage<T> = T[] | { page?: T[]; isDone?: boolean; continueCursor?: string };

function teamId(team: AdapterTeam) {
  return String(team.id ?? team._id ?? "");
}

async function adapterRows<T>(
  ctx: TeamAccessCtx,
  model: "team" | "teamMember",
  where: Array<{ field: string; value: string }>,
) {
  const rows: T[] = [];
  let cursor: string | null = null;
  do {
    const result = await ctx.runQuery(components.betterAuth.adapter.findMany, {
      model,
      paginationOpts: { cursor, numItems: 200 },
      where,
    }) as AdapterPage<T>;
    if (Array.isArray(result)) return result;
    rows.push(...(result.page ?? []));
    if (result.isDone !== false) return rows;
    if (!result.continueCursor || result.continueCursor === cursor) {
      throw new ConvexError({ code: "TEAM_PRINCIPAL_PAGINATION_STALLED", message: "Live Team membership could not be resolved safely." });
    }
    cursor = result.continueCursor;
  } while (cursor);
  return rows;
}

async function organizationTeams(ctx: TeamAccessCtx, organizationId: string) {
  const teams = await adapterRows<AdapterTeam>(ctx, "team", [{ field: "organizationId", value: organizationId }]);
  return teams.filter((team) => team.organizationId === organizationId && teamId(team));
}

/** Resolves Better Auth Team membership live; callers never persist expanded user grants. */
export async function resolveActorTeamIds(
  ctx: TeamAccessCtx,
  organizationId: string,
  userId: string,
) {
  const [teams, memberships] = await Promise.all([
    organizationTeams(ctx, organizationId),
    adapterRows<AdapterTeamMember>(ctx, "teamMember", [{ field: "userId", value: userId }]),
  ]);
  const organizationTeamIds = new Set(teams.map(teamId));
  return [...new Set(memberships
    .filter((membership) => membership.userId === userId && membership.teamId && organizationTeamIds.has(membership.teamId))
    .map((membership) => membership.teamId as string))];
}

export async function assertTeamInOrganization(
  ctx: TeamAccessCtx,
  organizationId: string,
  candidateTeamId: string,
) {
  const exists = (await organizationTeams(ctx, organizationId)).some((team) => teamId(team) === candidateTeamId);
  if (!exists) {
    throw new ConvexError({ code: "TEAM_SCOPE_INVALID", message: "The Team is not active in this organization.", organizationId, teamId: candidateTeamId });
  }
}
