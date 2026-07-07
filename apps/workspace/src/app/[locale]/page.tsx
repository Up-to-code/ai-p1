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
    const cookieStore = await cookies();
    isAuthenticated = cookieStore.has("better-auth.session_token");
  } catch {
    isAuthenticated = false;
  }

  if (isAuthenticated) {
    redirect(`/${locale}/choose-org`);
  }

  redirect(new URL(`/${locale}`, brandDomainUrl("root")).toString());
}
