import {getRequestConfig} from 'next-intl/server';
import { brandLabel, brandProductName } from '@qentrah/brand-identity';
import {routing} from '@/i18n/routing';

type Locale = (typeof routing.locales)[number];

function isLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

function applyBrandMessages(value: unknown, locale: Locale): unknown {
  if (typeof value === "string") {
    const brand = brandLabel(locale);
    const workspace = brandProductName("workspace", locale);
    const platform = brandProductName("platform", locale);

    return value
      .replaceAll("Qentrahd Workspace", workspace)
      .replaceAll("Qentrahd Platform", platform)
      .replaceAll("Qentrahd", brand)
      .replaceAll("Qentrah Workspace", workspace)
      .replaceAll("Qentrah Platform", platform)
      .replaceAll("Qentrah", brand)
      .replaceAll("أنان", brand);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => applyBrandMessages(entry, locale));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, applyBrandMessages(entry, locale)]),
    );
  }

  return value;
}

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // Ensure that a valid locale is used
  if (!locale || !isLocale(locale)) {
    locale = routing.defaultLocale;
  }
 
  const resolvedLocale = locale as Locale;

  return {
    locale: resolvedLocale as string,
    messages: applyBrandMessages((await import(`../../messages/${resolvedLocale}.json`)).default, resolvedLocale) as Record<string, unknown>
  };
});
