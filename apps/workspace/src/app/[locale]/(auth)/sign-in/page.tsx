import { AuthEntryClient } from "@/domains/auth/components/auth-entry-client";
import { redirectAuthenticatedUserFromAuthEntry } from "@/domains/auth/server-auth-routing";

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackURL?: string }>;
}) {
  const { locale } = await params;
  await redirectAuthenticatedUserFromAuthEntry(locale);
  const { callbackURL } = await searchParams;
  return <AuthEntryClient callbackURL={callbackURL} locale={locale} mode="sign-in" />;
}
