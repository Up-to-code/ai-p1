import { redirect } from "next/navigation";

export default async function WsTableViewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/ws`);
}
