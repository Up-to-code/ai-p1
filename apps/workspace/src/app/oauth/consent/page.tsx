import { cookies, headers } from "next/headers";
import { OAuthConsentClient } from "./consent-client";
import { resolveOAuthLocale } from "../oauth-locale";

export default async function OAuthConsentPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveOAuthLocale({
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });

  return <OAuthConsentClient locale={locale} />;
}
