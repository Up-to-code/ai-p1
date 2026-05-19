import { createContext, useContext, useEffect, useMemo, useRef, type PropsWithChildren } from "react";
import { DevSettings, I18nManager } from "react-native";

import {
  formatLocaleDateTime,
  formatLocaleNumber,
  type AppLocale,
} from "./webCompat";
import { formatWebCopy, getWebDictionary } from "./webCompat";
import { useAppStore } from "@/store";

import { getMobileDictionary, type MobileDictionary } from "./mobileDictionary";
import {
  detectDeviceLocale,
  resolveEffectiveLocale,
  resolveLocaleDirection,
  type LocalePreference,
} from "./core";

export type AppDictionary = Record<string, any> & ReturnType<typeof getWebDictionary> & MobileDictionary;

type LocalizationContextValue = {
  locale: AppLocale;
  direction: "rtl" | "ltr";
  isRTL: boolean;
  t: AppDictionary;
  deviceLocale: AppLocale;
  localePreference: LocalePreference;
  setLocalePreference: (value: LocalePreference) => void;
  formatDate: (value: number | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
};

const defaultLocale = detectDeviceLocale();

const LocalizationContext = createContext<LocalizationContextValue>({
  locale: defaultLocale,
  direction: resolveLocaleDirection(defaultLocale),
  isRTL: resolveLocaleDirection(defaultLocale) === "rtl",
  t: {
    ...getWebDictionary(defaultLocale),
    ...getMobileDictionary(defaultLocale),
  },
  deviceLocale: defaultLocale,
  localePreference: "system",
  setLocalePreference: () => undefined,
  formatDate: (value, options) => formatLocaleDateTime(defaultLocale, value, options),
  formatNumber: (value, options) => formatLocaleNumber(defaultLocale, value, options),
});

export function LocalizationProvider({ children }: PropsWithChildren) {
  const localePreference = useAppStore((state) => state.localePreference);
  const setLocalePreference = useAppStore((state) => state.setLocalePreference);
  const deviceLocale = detectDeviceLocale();
  const locale = resolveEffectiveLocale(localePreference, deviceLocale);
  const direction = resolveLocaleDirection(locale);
  const lastDirectionRef = useRef<"rtl" | "ltr" | null>(null);

  useEffect(() => {
    I18nManager.allowRTL(direction === "rtl");
    I18nManager.forceRTL(direction === "rtl");

    if (lastDirectionRef.current && lastDirectionRef.current !== direction) {
      try {
        DevSettings.reload();
      } catch {
        // The hybrid approach still mirrors layout through app-level helpers when reload is unavailable.
      }
    }

    lastDirectionRef.current = direction;
  }, [direction]);

  const value = useMemo<LocalizationContextValue>(() => {
    const dictionary = {
      ...getWebDictionary(locale),
      ...getMobileDictionary(locale),
    };

    return {
      locale,
      direction,
      isRTL: direction === "rtl",
      t: dictionary,
      deviceLocale,
      localePreference,
      setLocalePreference,
      formatDate: (input, options) => formatLocaleDateTime(locale, input, options),
      formatNumber: (input, options) => formatLocaleNumber(locale, input, options),
    };
  }, [deviceLocale, direction, locale, localePreference, setLocalePreference]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useAppLocalization() {
  return useContext(LocalizationContext);
}

export function useTranslation() {
  const { t, locale, direction, isRTL, formatDate, formatNumber } = useAppLocalization();
  return {
    t,
    locale,
    direction,
    isRTL,
    formatDate,
    formatNumber,
  };
}

export { formatWebCopy };
