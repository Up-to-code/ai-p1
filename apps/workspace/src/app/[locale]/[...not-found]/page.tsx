import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import NotFound from "../not-found";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NotFound");
  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function LocaleNotFoundCatchAll() {
  return <NotFound />;
}
