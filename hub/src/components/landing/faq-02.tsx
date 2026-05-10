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
      className="bg-white dark:bg-zinc-950"
      contentClassName="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"
    >
      <Reveal>
        <div className="max-w-xl space-y-5">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-blue-500/25 dark:bg-blue-500/45" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-300">
              {t("eyebrow")}
            </span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-6xl rtl:leading-[1.2]">
            {t("title")}
          </h2>
          <p className="text-base leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-lg">
            {t("description")}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <Accordion
          defaultValue={["item-0"]}
          className="rounded-[2rem] border border-zinc-200 bg-zinc-50/70 px-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] md:px-8"
        >
          {items.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
              className="last:border-b-0"
            >
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </PublicSection>
  );
}
