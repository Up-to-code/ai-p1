import { redirect } from "next/navigation";

export default async function IntegrationDetailsPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  redirect(`/${locale}/web-apps/${id}`);
}
