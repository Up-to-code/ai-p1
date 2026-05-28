import { getRequestConfig } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { getMarketingMessages } from "@/lib/content";

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

  return {
    locale: resolvedLocale,
    messages: getMarketingMessages(resolvedLocale),
  };
});
