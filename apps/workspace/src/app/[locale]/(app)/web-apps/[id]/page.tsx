import { redirect } from "next/navigation";

export default async function WebAppDetailsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard`);
}
