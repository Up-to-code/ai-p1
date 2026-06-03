import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("Workspace auth route source", () => {
  it("keeps organization selection behind a hydrated Better Auth session", () => {
    const source = readSource("src/app/[locale]/(auth)/choose-org/page.tsx");
    const signedInContent = source.slice(source.indexOf("function ChooseOrgSignedInContent"));

    expect(source).toContain("authClient.useSession()");
    expect(source).toContain("router.replace(`/sign-in?callbackURL=${encodeURIComponent(`/${locale}/choose-org`)}`)");
    expect(source).toContain("return <AuthRouteLoadingState brandLabel={brandLabel} />");
    expect(source).toContain("<ChooseOrgSignedInContent />");
    expect(signedInContent).toContain("authClient.useListOrganizations()");
  });

  it("defaults auth entry and dashboard redirects to organization selection", () => {
    const signIn = readSource("src/app/[locale]/(auth)/sign-in/page.tsx");
    const signUp = readSource("src/app/[locale]/(auth)/sign-up/page.tsx");
    const dashboardShell = readSource("src/components/providers/dashboard-app-wrapper.tsx");
    const convexAuth = readSource("convex/auth.ts");

    expect(signIn).toContain("resolveAuthEntryCallbackUrl(locale, requestedCallback)");
    expect(signUp).toContain("resolveAuthEntryCallbackUrl(locale, requestedCallback)");
    expect(dashboardShell).toContain("getWorkspaceAuthRedirect");
    expect(dashboardShell).not.toContain("usePathname");
    expect(dashboardShell).not.toContain("useSearchParams");
    expect(dashboardShell).not.toContain("callbackURL");
    expect(convexAuth).toContain("workspaceAuthCallbackPlugin()");
    expect(convexAuth).toContain("normalizeSocialSignInCallbackURL(ctx.body.callbackURL)");
  });
});
