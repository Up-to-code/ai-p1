import { ResourceConsole } from "@/components/ResourceConsole";
import { demoBrandConfig, publicDemoConfig, requestedScopes } from "@/lib/config";
import { readTokenSession } from "@/lib/session";
import { createQentrahCredentialSnapshot } from "@qentrah/auth-sdk/partner/harness";

export default async function DashboardPage() {
  const session = await readTokenSession();
  const publicConfig = publicDemoConfig();
  const credentialSnapshot = createQentrahCredentialSnapshot({
    workspaceBaseUrl: publicConfig.workspaceBaseUrl,
    requestedScopes: [...requestedScopes],
    session,
  });
  const expiresAt = credentialSnapshot.tokenExpiresAt ? new Date(credentialSnapshot.tokenExpiresAt) : null;

  return (
    <ResourceConsole
      runtime={{
        connected: credentialSnapshot.connected,
        organizationId: credentialSnapshot.organizationId,
        expiresAt: expiresAt?.toLocaleString(),
        workspaceBaseUrl: publicConfig.workspaceBaseUrl,
        partnerAppUrl: publicConfig.partnerAppUrl,
        resourceAudience: credentialSnapshot.resourceAudience,
        requestedScopes: credentialSnapshot.requestedScopes,
        grantedScopes: credentialSnapshot.grantedScopes,
      }}
    />
  );
}

export const metadata = {
  title: `${demoBrandConfig.appName} Dashboard`,
};
