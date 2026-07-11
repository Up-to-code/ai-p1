import { cookies, headers } from "next/headers";
import { OAuthConsentClient } from "./consent-client";
import { resolveOAuthLocale } from "../oauth-locale";

export default async function OAuthConsentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const params = await searchParams;
  const locale = resolveOAuthLocale({
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
  const scopeValue = Array.isArray(params.scope) ? params.scope[0] : params.scope;
  const clientIdValue = Array.isArray(params.client_id) ? params.client_id[0] : params.client_id;
  const scopes = (scopeValue ?? "").split(/\s+/u).filter(Boolean);

  return (
    <OAuthConsentClient
      clientId={clientIdValue ?? ""}
      locale={locale}
      scopes={scopes}
    />
  );
}
