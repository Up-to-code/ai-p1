import { ChooseOrganizationClient } from "@/domains/auth/components/choose-organization-client";
import { redirectInvalidChooseOrganizationAccess } from "@/domains/auth/server-auth-routing";

export default async function ChooseOrgPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackURL?: string }>;
}) {
  const { locale } = await params;
  const { callbackURL } = await searchParams;
  await redirectInvalidChooseOrganizationAccess(locale, callbackURL);
  return <ChooseOrganizationClient callbackURL={callbackURL} locale={locale} />;
}
