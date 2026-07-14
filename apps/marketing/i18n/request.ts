import { getRequestConfig } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { getMarketingContent } from "@/lib/contentful";

type Locale = (typeof routing.locales)[number];

function isRoutingLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !isRoutingLocale(locale)) {
    locale = routing.defaultLocale;
  }

  const resolvedLocale = locale as Locale;
  const content = await getMarketingContent(resolvedLocale);

  return {
    locale: resolvedLocale,
    messages: content.messages,
  };
});
