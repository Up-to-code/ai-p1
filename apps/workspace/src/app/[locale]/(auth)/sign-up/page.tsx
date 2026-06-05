import { AuthEntryClient } from "@/domains/auth/components/auth-entry-client";

export default async function SignUpPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackURL?: string }>;
}) {
  const { locale } = await params;
  const { callbackURL } = await searchParams;
  return <AuthEntryClient callbackURL={callbackURL} locale={locale} mode="sign-up" />;
}
