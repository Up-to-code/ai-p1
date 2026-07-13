import { redirect } from "next/navigation";
import { resolveWorkspaceAuthEntry } from "@/domains/auth/utils/workspace-auth-entry";
import { isAuthenticated } from "@/server/auth/auth-request";

export default async function WorkspaceHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const authenticated = await isAuthenticated().catch(() => false);
  redirect(resolveWorkspaceAuthEntry(locale, authenticated));
}
