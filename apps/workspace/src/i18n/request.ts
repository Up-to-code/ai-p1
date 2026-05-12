import {getRequestConfig} from 'next-intl/server';
import {routing} from '@/i18n/routing';

type Locale = (typeof routing.locales)[number];

function isLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // Ensure that a valid locale is used
  if (!locale || !isLocale(locale)) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale: locale as string,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
