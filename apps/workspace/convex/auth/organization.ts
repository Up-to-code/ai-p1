import { requireRunMutationCtx } from "@convex-dev/better-auth/utils";
import { organization } from "better-auth/plugins";
import { getTransactionalFromEmail, resend } from "../email";
import { asBetterAuthAdapterContext, type BetterAuthRuntimeContext } from "./runtime";

export function createOrganizationPlugin(
  ctx: BetterAuthRuntimeContext,
  workspaceOrigin: string,
) {
  return organization({
    sendInvitationEmail: async ({ invitation, inviter, organization: invitedOrganization }) => {
      const invitationId = invitation.id || (invitation as { _id?: string })._id;
      if (!invitationId) {
        throw new Error("Invitation email could not be sent because the invitation id is missing.");
      }

      const inviteUrl = `${workspaceOrigin}/en/accept-invite?invitationId=${encodeURIComponent(invitationId)}`;
      const invitedBy = inviter.user.name || inviter.user.email || "A teammate";

      await resend.sendEmail(requireRunMutationCtx(asBetterAuthAdapterContext(ctx)), {
        from: getTransactionalFromEmail(),
        to: invitation.email,
        subject: `${invitedBy} invited you to join ${invitedOrganization.name} on Qentrah`,
        html: [
          `<p>${invitedBy} invited you to join ${invitedOrganization.name} on Qentrah.</p>`,
          `<p><a href="${inviteUrl}">Accept invitation</a></p>`,
          "<p>If you were not expecting this invitation, you can ignore this email.</p>",
        ].join(""),
        text: [
          `${invitedBy} invited you to join ${invitedOrganization.name} on Qentrah.`,
          "",
          `Accept invitation: ${inviteUrl}`,
          "",
          "If you were not expecting this invitation, you can ignore this email.",
        ].join("\n"),
      });
    },
  });
}
