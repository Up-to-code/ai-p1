import { ChooseOrganizationClient } from "@/domains/auth/components/choose-organization-client";

export default async function ChooseOrgPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ChooseOrganizationClient locale={locale} />;
}
