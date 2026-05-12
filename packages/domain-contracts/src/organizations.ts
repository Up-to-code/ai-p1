import { z } from "zod";
import type { UploadedFileReference } from "./files";
import { GCC_COUNTRY_CODES } from "./gccCountries";

export type OrganizationVerificationRequestStatus =
  | "not_submitted"
  | "new"
  | "in_review"
  | "approved"
  | "rejected"
  | "closed";

/**
 * WHY:   Workspace settings need a stable organization-wide verification read model.
 * WHAT:  Summarizes the latest organization verification request plus the derived publishing gate.
 * HOW:   Mirrors the latest org-scoped verification request and augments it with computed blocking state.
 */
export type OrganizationVerificationSummary = {
  isVerified: boolean;
  currentRequestId: string | null;
  currentRequestStatus: OrganizationVerificationRequestStatus;
  lastSubmittedAt: number | null;
  lastReviewedAt: number | null;
  reviewerNotes: string | null;
  documentsCount: number;
  publishingBlocked: boolean;
  attachedDocuments: UploadedFileReference[];
  requirements: string[];
  sourceUrls: string[];
};

/**
 * WHY:   Organization creation is the first migrated business mutation in the Next.js gateway.
 * WHAT:  OrganizationSummary is the stable response shape returned by domain services and routes.
 * HOW:   It is derived from Convex organization documents and limited to the fields the web app currently renders.
 */
export type OrganizationSummary = {
  id: string;
  organizationId?: string;
  type: "broker" | "red";
  name: string;
  slug: string;
  countryCode?: string;
  countryLabel?: string | null;
  status: "active" | "pending" | null;
  isVerified: boolean;
  logoUrl?: string | null;
  description?: string;
  website?: string;
  contactEmail?: string;
  phone?: string;
  verificationSummary?: OrganizationVerificationSummary;
  legacyOwnerType?: "broker" | "RED" | null;
  legacyOwnerId?: string | null;
  legacyTenantOrgId?: string | null;
};

/**
 * WHY:   Team management flows need a stable member shape independent of Convex profile records.
 * WHAT:  OrganizationTeamMember captures the subset of profile data rendered by workspace team screens.
 * HOW:   It normalizes userProfiles into a role-safe DTO with only display and access fields.
 */
export type OrganizationTeamMember = {
  id: string;
  authUserId: string;
  membershipId?: string;
  name: string;
  email: string;
  username?: string;
  role: "manager" | "member" | "viewer";
  roleApprovalStatus?: string;
  isActive?: boolean;
};

export type OrganizationMembershipSummary = {
  id: string;
  ownerType?: "broker" | "RED";
  ownerId?: string;
  authUserId: string;
  profileId?: string;
  role: "manager" | "member" | "viewer";
  tenantRole?: string;
  status: "active" | "inactive";
  createdAt: number;
  updatedAt: number;
};

/**
 * WHY:   Invite management should not leak raw Convex rows into the web layer.
 * WHAT:  OrganizationInviteSummary is the normalized invite DTO used by server functions and pages.
 * HOW:   It keeps only owner-neutral invite metadata and hides table-specific details.
 */
export type OrganizationInviteSummary = {
  id: string;
  email: string;
  role: "manager" | "member" | "viewer";
  status: "pending" | "accepted" | "canceled";
  token: string;
  expiresAt: number;
  acceptedAt?: number;
};

/**
 * WHY:   The gateway should validate payloads before they reach Convex mutations.
 * WHAT:  Zod schema for organization creation requests.
 * HOW:   Trims the name, enforces a minimum length, and constrains the organization type enum.
 */
export const createOrganizationInputSchema = z.object({
  name: z.string().trim().min(2, "Organization name must be at least 2 characters").max(120),
  type: z.enum(["broker", "red"]).optional(),
  countryCode: z.enum(GCC_COUNTRY_CODES).default("SA"),
});

/**
 * WHY:   Domain services and repositories share the same validated create payload.
 * WHAT:  TypeScript inference for the organization creation schema.
 * HOW:   Derived directly from `createOrganizationInputSchema`.
 */
export type CreateOrganizationInput = z.infer<typeof createOrganizationInputSchema>;

export const createOrganizationInviteInputSchema = z.object({
  email: z.string().trim().email("Invite email must be valid"),
  role: z.enum(["manager", "member", "viewer"]),
});

export type CreateOrganizationInviteInput = z.infer<typeof createOrganizationInviteInputSchema>;

export const updateOrganizationInputSchema = z.object({
  name: z.string().trim().min(2, "Organization name must be at least 2 characters").max(120),
  description: z.preprocess(
    (value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
    z.string().trim().max(500, "Organization description must be at most 500 characters").optional(),
  ),
  website: z.preprocess(
    (value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
    z.string().trim().url("Organization website must be a valid URL").max(300).optional(),
  ),
  contactEmail: z.preprocess(
    (value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
    z.string().trim().email("Organization contact email must be valid").max(200).optional(),
  ),
  phone: z.preprocess(
    (value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
    z.string().trim().max(40, "Organization phone must be at most 40 characters").optional(),
  ),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationInputSchema>;

export const updateOrganizationMemberRoleInputSchema = z.object({
  role: z.enum(["manager", "member", "viewer"]),
});

export type UpdateOrganizationMemberRoleInput = z.infer<typeof updateOrganizationMemberRoleInputSchema>;

export type DirectorySearchResult = {
  id: string;
  authUserId: string;
  email: string;
  name: string;
  username?: string;
  membershipState: "not-member" | "pending-invite" | "member";
  canMessage: boolean;
  conversationId?: string | null;
};

export type OffersDirectoryProfile = {
  id: string;
  authUserId: string;
  email: string;
  name: string;
  username?: string;
  image?: string | null;
  role: "broker" | "developer";
  organizationName: string;
  organizationSlug?: string;
  organizationLogo?: string | null;
  membershipState: "not-member" | "pending-invite" | "member";
  canMessage: boolean;
  conversationId?: string | null;
};

export type IncomingOrganizationInvite = {
  id: string;
  token: string;
  acceptUrl?: string | null;
  email: string;
  role: "manager" | "member" | "viewer";
  organizationName: string;
  organizationType: "broker" | "developer";
  inviterName: string;
  inviterAuthUserId: string;
  canMessage: boolean;
  conversationId?: string | null;
  expiresAt: number;
};

export type OfferOrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  offerCount: number;
};

export type OrganizationPublicOffer = {
  id: string;
  price: number;
  status: string;
  description?: string;
  property: {
    id: string;
    title: string;
    address: string;
    location?: string;
  } | null;
};

export type OrganizationPublicProfile = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string;
  website?: string;
  contactEmail?: string;
  offers: OrganizationPublicOffer[];
};
