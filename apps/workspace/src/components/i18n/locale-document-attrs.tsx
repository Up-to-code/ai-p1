"use client";

import { useEffect } from "react";

export function LocaleDocumentAttrs({ locale }: { locale: string }) {
  useEffect(() => {
    const isAr = locale === "ar";

    document.documentElement.lang = locale;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.body.classList.toggle("font-cairo", isAr);

    return () => {
      document.body.classList.remove("font-cairo");
    };
  }, [locale]);

  return null;
}
