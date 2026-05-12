"use client";

import { useEffect } from "react";
import { useLocale, useMessages } from "next-intl";

const TRANSLATABLE_ATTRIBUTES = ["placeholder", "aria-label", "title", "alt"] as const;

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function preserveSpacing(original: string, translated: string) {
  const leading = original.match(/^\s*/)?.[0] ?? "";
  const trailing = original.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translated}${trailing}`;
}

export function UiLocalizer() {
  const locale = useLocale();
  const messages = useMessages();

  useEffect(() => {
    if (locale !== "ar") {
      return;
    }

    const dictionary = (messages as { AutoUi?: Record<string, string> }).AutoUi ?? {};
    let applying = false;

    const translateValue = (value: string) => {
      const key = normalize(value).replace(/\./g, "___");
      return key ? dictionary[key] : undefined;
    };

    const translateElement = (element: Element) => {
      for (const attr of TRANSLATABLE_ATTRIBUTES) {
        const current = element.getAttribute(attr);
        const translated = current ? translateValue(current) : undefined;
        if (translated && current !== translated) {
          element.setAttribute(attr, translated);
        }
      }

      if (
        element instanceof HTMLInputElement &&
        ["button", "submit", "reset"].includes(element.type)
      ) {
        const translated = translateValue(element.value);
        if (translated && element.value !== translated) {
          element.value = translated;
        }
      }
    };

    const translateTextNode = (node: Text) => {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(parent.tagName)) {
        return;
      }

      const translated = translateValue(node.nodeValue ?? "");
      if (translated && node.nodeValue !== translated) {
        node.nodeValue = preserveSpacing(node.nodeValue ?? "", translated);
      }
    };

    const applyTranslations = () => {
      if (applying) {
        return;
      }

      applying = true;
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let current = walker.nextNode();
      while (current) {
        translateTextNode(current as Text);
        current = walker.nextNode();
      }

      document.body.querySelectorAll("*").forEach(translateElement);
      applying = false;
    };

    applyTranslations();

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(applyTranslations);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
    });

    return () => observer.disconnect();
  }, [locale, messages]);

  return null;
}
