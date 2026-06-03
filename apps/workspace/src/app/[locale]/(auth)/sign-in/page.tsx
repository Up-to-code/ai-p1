import { redirect } from "next/navigation";

import { createLocaleAuthCallbackUrl } from "@/domains/auth";

function safeLocalizedCallback(value: string | string[] | undefined, locale: string) {
  const callback = Array.isArray(value) ? value[0] : value;
  return callback?.startsWith(`/${locale}/`) ? callback : createLocaleAuthCallbackUrl(locale, "/dashboard");
}

function safeOrganizationId(value: string | string[] | undefined) {
  const organizationId = Array.isArray(value) ? value[0] : value;
  return organizationId && /^org_[A-Za-z0-9]+$/.test(organizationId) ? organizationId : undefined;
}

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackURL?: string | string[]; returnTo?: string | string[]; organizationId?: string | string[] }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const callbackURL = safeLocalizedCallback(query.returnTo ?? query.callbackURL, locale);
  const nextParams = new URLSearchParams({ returnTo: callbackURL });
  const organizationId = safeOrganizationId(query.organizationId);
  if (organizationId) nextParams.set("organizationId", organizationId);

  redirect(`/sign-in?${nextParams.toString()}`);
}
