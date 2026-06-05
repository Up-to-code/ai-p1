import { AuthCallbackClient } from "@/domains/auth/components/auth-callback-client";

export default async function SsoCallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackURL?: string }>;
}) {
  const { locale } = await params;
  const { callbackURL } = await searchParams;
  return <AuthCallbackClient callbackURL={callbackURL} locale={locale} />;
}
