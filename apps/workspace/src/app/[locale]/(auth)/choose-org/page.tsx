import { ChooseOrganizationClient } from "@/domains/auth/components/choose-organization-client";
import { redirectInvalidChooseOrganizationAccess } from "@/domains/auth/server-auth-routing";

export default async function ChooseOrgPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await redirectInvalidChooseOrganizationAccess(locale);
  return <ChooseOrganizationClient locale={locale} />;
}
