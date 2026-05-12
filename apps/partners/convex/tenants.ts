import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { Tenants } from "@djpanda/convex-tenants";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const noopAuthzRelationRef = makeFunctionReference<"mutation">("tenants:noopAuthzRelation");

const partnersTenantAuthorizationAdapter = {
  component: {
    rebac: {
      addRelation: noopAuthzRelationRef,
      removeRelation: noopAuthzRelationRef,
    },
  },
  can: async () => true,
  require: async () => undefined,
  assignRole: async () => undefined,
  revokeRole: async () => undefined,
  grantPermission: async () => undefined,
  denyPermission: async () => undefined,
  getUserPermissions: async () => [],
  getUserRoles: async () => [],
  getAuditLog: async () => ({ page: [], isDone: true, continueCursor: "" }),
} as any;

export const noopAuthzRelation = internalMutation({
  args: {
    subjectType: v.optional(v.string()),
    subjectId: v.optional(v.string()),
    relation: v.optional(v.string()),
    objectType: v.optional(v.string()),
    objectId: v.optional(v.string()),
  },
  handler: async () => undefined,
});

export const tenants = new Tenants(components.tenants, {
  authz: partnersTenantAuthorizationAdapter,
  creatorRole: "owner",
  permissionMap: {
    createOrganization: false,
  },
});

function buildProgrammerTenantSlug(authSubject: string) {
  const body = authSubject
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 56);
  return `programmer-${body || "partner"}`;
}

export async function createProgrammerTenantOrganization(
  ctx: any,
  input: {
    ownerAuthSubject: string;
    name: string;
    countryCode: string;
  },
) {
  const slug = buildProgrammerTenantSlug(input.ownerAuthSubject);
  const existing = await tenants.getOrganizationBySlug(ctx, slug);
  if (existing) {
    return existing._id;
  }

  return await tenants.createOrganization(ctx, input.ownerAuthSubject, input.name, {
    slug,
    metadata: {
      type: "programmer",
      countryCode: input.countryCode,
    },
    settings: {
      allowPublicSignup: false,
      requireInvitationToJoin: true,
    },
  });
}
