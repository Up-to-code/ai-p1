"use client";

import { useTranslations } from "next-intl";

import { Reveal } from "@/components/landing/cinematic-motion";
import { PublicSection } from "@/components/landing/public-landing-kit";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FaqItem = {
  question: string;
  answer: string;
};

export function Faq02() {
  const t = useTranslations("Landing.home.faq");
  const items = t.raw("items") as FaqItem[];

  return (
    <PublicSection
      id="faq"
      className="bg-white dark:bg-[#0A0A0A]"
      contentClassName="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:items-start"
    >
      <Reveal>
        <div className="max-w-xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-blue-500/25 dark:bg-blue-500/45" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">
              {t("eyebrow")}
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-5xl rtl:leading-[1.25]">
            {t("title")}
          </h2>
          <p className="text-base font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-lg">
            {t("description")}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <Accordion
          defaultValue={["item-0"]}
          className="w-full"
        >
          {items.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
              className="border-b border-zinc-200 dark:border-white/10 px-2 transition-colors duration-300 hover:bg-zinc-50/50 dark:hover:bg-white/[0.02]"
            >
              <AccordionTrigger className="text-start py-6 text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-100 transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-base font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed pb-6">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </PublicSection>
  );
}
