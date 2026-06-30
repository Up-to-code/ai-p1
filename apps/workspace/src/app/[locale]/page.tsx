import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { brandDomainUrl } from "@qentrah/brand-identity";

export default async function WorkspaceHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let isAuthenticated = false;

  try {
    const { userId } = await auth();
    isAuthenticated = !!userId;
  } catch {
    isAuthenticated = (await cookies()).has("__session");
  }

  if (isAuthenticated) {
    redirect(`/${locale}/ws`);
  }

  redirect(new URL(`/${locale}`, brandDomainUrl("root")).toString());
}
