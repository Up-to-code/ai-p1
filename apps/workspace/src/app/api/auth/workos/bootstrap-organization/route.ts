import { api } from "@convex/_generated/api";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { convexCalls } from "@/server/convex/http-client";
import { assertWorkOSConfigured, getWorkOSClient } from "@/server/auth/workos";

function safeLocale(value: string | null) {
  return value === "ar" ? "ar" : "en";
}

function formValue(formData: FormData, name: string, fallback: string) {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function POST(request: Request) {
  assertWorkOSConfigured();
  const url = new URL(request.url);
  const locale = safeLocale(url.searchParams.get("locale"));
  const auth = await withAuth({ ensureSignedIn: true });
  const formData = await request.formData();
  const organizationName = formValue(formData, "name", "Qentrah Workspace");
  const organizationType = formValue(formData, "type", "broker");
  const localOrganizationId = `org_local_${crypto.randomUUID().replaceAll("-", "")}`;

  const organization = await getWorkOSClient().organizations.createOrganization({
    name: organizationName,
    externalId: localOrganizationId,
    metadata: {
      qentrah_organization_id: localOrganizationId,
      qentrah_organization_type: organizationType,
    },
  }, {
    idempotencyKey: `qentrah-bootstrap-${auth.user.id}-${localOrganizationId}`,
  });

  const membership = await getWorkOSClient().userManagement.createOrganizationMembership({
    organizationId: organization.id,
    userId: auth.user.id,
    roleSlug: "admin",
  });

  await convexCalls.mutation(api.workosAuth.bootstrapWorkspaceOwner, {
    organizationId: localOrganizationId,
    workosOrganizationId: organization.id,
    organizationName,
    organizationType,
    workosUserId: auth.user.id,
    workosMembershipId: membership.id,
    email: auth.user.email,
  });

  const signIn = new URL("/sign-in", url.origin);
  signIn.searchParams.set("returnTo", `/${locale}/dashboard`);
  signIn.searchParams.set("organizationId", organization.id);
  redirect(signIn.toString());
}
