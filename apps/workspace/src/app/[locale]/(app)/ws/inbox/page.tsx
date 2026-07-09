import { redirect } from "next/navigation";
import {
  buildCanonicalRedirectPath,
  type PageSearchParams,
} from "@/domains/navigation/canonical-redirect";

export default async function WsInboxPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<PageSearchParams>;
}) {
  const { locale } = await params;
  redirect(buildCanonicalRedirectPath(locale, "/inbox", await searchParams));
}
