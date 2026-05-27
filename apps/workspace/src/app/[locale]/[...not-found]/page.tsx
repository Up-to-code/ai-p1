import { redirect } from "next/navigation";

import NotFound from "../not-found";

export default async function LocaleNotFoundCatchAll({
  params,
}: {
  params: Promise<{ locale: string; "not-found": string[] }>;
}) {
  const { locale, "not-found": segments } = await params;

  if (segments.join("/") === "team-public") {
    redirect(`/${locale}/about`);
  }

  return <NotFound />;
}
