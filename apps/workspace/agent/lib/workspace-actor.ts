import type { SessionAuth } from "eve/context";

export type WorkspaceActorErrorCode =
  | "EVE_AUTHENTICATION_REQUIRED"
  | "EVE_ACTOR_INVALID";

export class WorkspaceActorError extends Error {
  constructor(
    readonly code: WorkspaceActorErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "WorkspaceActorError";
  }
}

export interface WorkspaceActor {
  readonly organizationId: string;
  readonly userId: string;
  readonly role: string;
  readonly sessionToken?: string;
  readonly convexToken?: string;
}

type ActorContext = {
  readonly session: { readonly auth: SessionAuth };
};

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function getWorkspaceActor(ctx: ActorContext): WorkspaceActor | null {
  const auth = ctx.session.auth.current;
  if (!auth) return null;

  const organizationId = nonEmptyString(auth.attributes?.organizationId);
  const userId = nonEmptyString(auth.attributes?.userId);
  const role = nonEmptyString(auth.attributes?.role);
  if (!organizationId || !userId || !role) return null;

  if (auth.principalId && auth.principalId !== userId) {
    throw new WorkspaceActorError(
      "EVE_ACTOR_INVALID",
      "The Eve principal does not match the authenticated Workspace user.",
    );
  }

  return {
    organizationId,
    userId,
    role,
    sessionToken: nonEmptyString(auth.attributes?.sessionToken) ?? undefined,
    convexToken: nonEmptyString(auth.attributes?.convexToken) ?? undefined,
  };
}

export function requireWorkspaceActor(ctx: ActorContext): WorkspaceActor {
  const actor = getWorkspaceActor(ctx);
  if (!actor) {
    throw new WorkspaceActorError(
      "EVE_AUTHENTICATION_REQUIRED",
      "An authenticated Workspace organization member is required.",
    );
  }
  return actor;
}

export function requireWorkspaceActorToken(
  ctx: ActorContext,
  token: "sessionToken" | "convexToken",
): string {
  const actor = requireWorkspaceActor(ctx);
  const value = actor[token];
  if (!value) {
    throw new WorkspaceActorError(
      "EVE_ACTOR_INVALID",
      `The authenticated Workspace actor is missing ${token}.`,
    );
  }
  return value;
}
