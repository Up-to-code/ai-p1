import { ChooseOrgClient } from "./choose-org-client";

export default async function ChooseOrgPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ChooseOrgClient locale={locale} />;
}
