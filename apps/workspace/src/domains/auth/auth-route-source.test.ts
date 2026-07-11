import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("Workspace auth route source", () => {
  const removedOrganizationTypeTerms = [
    "organization" + "Type",
    "set" + "Organization" + "Type",
    "public" + "Metadata: { type",
    "type" + "Broker",
    "type" + "Developer",
    "create" + "Type" + "Label",
    "create" + "Type" + "Placeholder",
  ];

  it("uses Qentrah-owned auth screens instead of provider prebuilt UI", () => {
    const chooseOrg = readSource("src/app/[locale]/(auth)/choose-org/page.tsx");
    const signIn = readSource("src/app/[locale]/(auth)/sign-in/page.tsx");
    const signUp = readSource("src/app/[locale]/(auth)/sign-up/page.tsx");
    const authScreen = readSource("src/components/auth/auth-access-screen.tsx");
    const authEntry = readSource("src/domains/auth/components/auth-entry-client.tsx");
    const authFlow = readSource("src/domains/auth/hooks/use-auth-flow.ts");

    expect(chooseOrg).not.toMatch(/import\s+\{[^}]*OrganizationList/);
    expect(chooseOrg).not.toContain("<OrganizationList");
    expect(signIn).not.toMatch(/import\s+\{[^}]*SignIn/);
    expect(signIn).not.toContain("<SignIn");
    expect(signUp).not.toMatch(/import\s+\{[^}]*SignUp/);
    expect(signUp).not.toContain("<SignUp");
    expect(chooseOrg).toContain("ChooseOrganizationClient");
    expect(signIn).toContain("AuthEntryClient");
    expect(signUp).toContain("AuthEntryClient");
    expect(authScreen).toContain("onCredentialsSubmit");
    expect(authScreen).toContain("onSocialSignIn");
    expect(authScreen).toContain("GoogleMark");
    expect(authEntry).toContain("useAuth");
    const chooseOrgClient = readSource("src/domains/auth/components/choose-organization-client.tsx");
    expect(chooseOrgClient).toContain("useOrganizationEntry");
    expect(authFlow).toContain("authClient.signIn.email");
    expect(authFlow).toContain("authClient.signUp.email");
  });

  it("uses Better Auth Convex auth wiring", () => {
    const dashboardShell = readSource("src/components/providers/dashboard-authenticated-shell.tsx");
    const dashboardRedirect = readSource("src/components/providers/dashboard-authenticated-shell/use-dashboard-auth-redirect.ts");
    const convexAuth = readSource("convex/auth.ts");

    expect(dashboardShell).toContain("useDashboardAuthRedirect");
    expect(dashboardRedirect).toContain("getWorkspaceAuthRedirect");
    expect(convexAuth).toContain("betterAuthClient.adapter");
    expect(convexAuth).toContain("convex({ authConfig })");
  });

  it("keeps organization creation name-only and routes new workspaces through onboarding", () => {
    const chooseOrgClient = readSource("src/domains/auth/components/choose-organization-client.tsx");
    const organizationEntry = readSource("src/domains/auth/hooks/use-organization-entry.ts");
    const enMessages = readSource("messages/en.json");
    const arMessages = readSource("messages/ar.json");

    for (const term of removedOrganizationTypeTerms) {
      expect(chooseOrgClient).not.toContain(term);
      expect(enMessages).not.toContain(term);
      expect(arMessages).not.toContain(term);
    }
    expect(chooseOrgClient).toContain("useOrganizationEntry");
    expect(organizationEntry).toContain('finishOrganizationSelection(result.data.id, "/onboarding")');
    expect(organizationEntry).toContain("resolvedCallbackURL");
    expect(organizationEntry).toContain("api.modelization.write.seedWorkspaceDefaults");
  });

  it("handles Better Auth organization setup errors", () => {
    const chooseOrgClient = readSource("src/domains/auth/components/choose-organization-client.tsx");
    const organizationEntry = readSource("src/domains/auth/hooks/use-organization-entry.ts");
    const enMessages = readSource("messages/en.json");

    expect(organizationEntry).toContain("isOrganizationsDisabledError");
    expect(organizationEntry).toContain("organizationsDisabled");
    expect(organizationEntry).toContain("isOrganizationSlugsDisabledError");
    expect(organizationEntry).toContain("slugsDisabled");
    expect(organizationEntry).not.toContain("slugify" + "Organization" + "Name");
    expect(organizationEntry).not.toContain("slug: " + "slugify");
    expect(enMessages).toContain("Organizations are not enabled");
  });
});
