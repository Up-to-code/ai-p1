import { cookies, headers } from "next/headers";
import { resolveOAuthLocale } from "../oauth-locale";
import { OAuthSelectOrganizationClient } from "./select-organization-client";

export default async function OAuthSelectOrganizationPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveOAuthLocale({
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });

  return <OAuthSelectOrganizationClient locale={locale} />;
}
