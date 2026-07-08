import { v } from "convex/values";
import { components } from "../../_generated/api";
import { action } from "../../_generated/server";
import { getAppUrl, getTransactionalFromEmail, resend } from "../../email";

type AdapterInvitation = {
  id?: string;
  _id?: string;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  organizationId?: string | null;
  inviterId?: string | null;
  expiresAt?: number | null;
  createdAt?: number | null;
};

type AdapterOrganization = {
  id?: string;
  _id?: string;
  name?: string | null;
};

const invitationReturn = v.object({
  id: v.string(),
  email: v.string(),
  role: v.string(),
  status: v.string(),
  organizationId: v.string(),
  organizationName: v.optional(v.union(v.null(), v.string())),
  inviterId: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  createdAt: v.optional(v.number()),
});

type InvitationPage = { page?: AdapterInvitation[] } | AdapterInvitation[];

function normalizeInvitationPage(invitationPage: InvitationPage) {
  return Array.isArray(invitationPage)
    ? invitationPage
    : (invitationPage.page ?? []);
}

function isActivePendingInvitation(invitation: AdapterInvitation, now: number) {
  if (invitation.status !== "pending") return false;
  if (!invitation.organizationId) return false;
  if (
    invitation.expiresAt !== undefined &&
    invitation.expiresAt !== null &&
    invitation.expiresAt <= now
  ) {
    return false;
  }
  return true;
}

async function getOrganization(ctx: any, organizationId: string) {
  return (await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "organization",
    where: [{ field: "_id", value: organizationId }],
  })) as AdapterOrganization | null;
}

function serializeInvitation(
  invitation: AdapterInvitation,
  email: string,
  organization: AdapterOrganization | null,
) {
  return {
    id: String(invitation.id ?? invitation._id ?? ""),
    email,
    role: invitation.role ?? "member",
    status: "pending",
    organizationId: invitation.organizationId as string,
    organizationName: organization?.name ?? null,
    inviterId: invitation.inviterId ?? undefined,
    expiresAt: invitation.expiresAt ?? undefined,
    createdAt: invitation.createdAt ?? undefined,
  };
}

export const listPendingForEmail = action({
  args: {
    email: v.string(),
  },
  returns: v.array(invitationReturn),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!email) return [];

    const invitationPage = (await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model: "invitation",
        paginationOpts: { cursor: null, numItems: 100 },
        where: [{ field: "email", value: email }],
      },
    )) as InvitationPage;
    const invitations = normalizeInvitationPage(invitationPage);

    const now = Date.now();
    const pending = invitations.filter((invitation) =>
      isActivePendingInvitation(invitation, now),
    );

    return Promise.all(
      pending.map(async (invitation) => {
        const organization = await getOrganization(
          ctx,
          invitation.organizationId as string,
        );

        return serializeInvitation(invitation, email, organization);
      }),
    );
  },
});

export const resendPendingInvitation = action({
  args: {
    organizationId: v.string(),
    email: v.string(),
    inviterName: v.optional(v.string()),
  },
  returns: invitationReturn,
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const invitationPage = (await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model: "invitation",
        paginationOpts: { cursor: null, numItems: 100 },
        where: [
          { field: "email", value: email },
          { field: "organizationId", value: args.organizationId },
        ],
      },
    )) as InvitationPage;
    const now = Date.now();
    const invitation = normalizeInvitationPage(invitationPage).find(
      (item) =>
        item.organizationId === args.organizationId &&
        isActivePendingInvitation(item, now),
    );

    if (!invitation) {
      throw new Error("No active pending invitation was found to resend.");
    }

    const organization = await getOrganization(ctx, args.organizationId);
    const invitationId = String(invitation.id ?? invitation._id ?? "");
    if (!invitationId) {
      throw new Error(
        "Invitation email could not be sent because the invitation id is missing.",
      );
    }

    const organizationName = organization?.name ?? "Qentrah";
    const invitedBy = args.inviterName?.trim() || "Ahmed, CEO of Qentrah";
    const inviteUrl = `${getAppUrl()}/en/accept-invite?invitationId=${encodeURIComponent(invitationId)}`;

    await resend.sendEmail(ctx, {
      from: getTransactionalFromEmail(),
      to: email,
      subject: `${invitedBy} invited you to join ${organizationName} on Qentrah`,
      html: [
        `<p>${invitedBy} invited you to join ${organizationName} on Qentrah.</p>`,
        `<p><a href="${inviteUrl}">Accept invitation</a></p>`,
        "<p>If you were not expecting this invitation, you can ignore this email.</p>",
      ].join(""),
      text: [
        `${invitedBy} invited you to join ${organizationName} on Qentrah.`,
        "",
        `Accept invitation: ${inviteUrl}`,
        "",
        "If you were not expecting this invitation, you can ignore this email.",
      ].join("\n"),
    });

    return serializeInvitation(invitation, email, organization);
  },
});
