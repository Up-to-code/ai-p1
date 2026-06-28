import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { brandDomainUrl } from "@qentrah/brand-identity";

export default async function WorkspaceHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();

  if (userId) {
    redirect(`/${locale}/ws`);
  }

  redirect(new URL(`/${locale}`, brandDomainUrl("root")).toString());
}
