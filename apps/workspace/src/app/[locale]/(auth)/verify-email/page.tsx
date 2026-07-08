import { VerifyEmailClient } from "@/domains/auth/components/verify-email-client";

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackURL?: string }>;
}) {
  const { locale } = await params;
  const { callbackURL } = await searchParams;

  return <VerifyEmailClient callbackURL={callbackURL} locale={locale} />;
}
