"use client";

import { Reveal } from "@/components/landing/cinematic-motion";
import { PublicSection } from "@/components/landing/public-landing-kit";
import { useMarketingContent } from "@/components/marketing/marketing-content-provider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Faq02() {
  const faq = useMarketingContent().landingPage.support.faq;

  return (
    <PublicSection
      id="faq"
      tone="default"
      contentClassName="grid max-w-6xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20 lg:items-start"
    >
      <Reveal>
        <div className="max-w-md space-y-5 lg:sticky lg:top-28">
          <div>
            <span className="inline-flex rounded-full border border-[var(--q-border)] bg-[var(--q-card)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--q-text-muted)] rtl:tracking-normal">
              {faq.eyebrow}
            </span>
          </div>
          <h2 className="max-w-[16ch] text-[clamp(2.35rem,3.6vw,3.55rem)] font-medium leading-[1.04] tracking-[-0.04em] text-balance text-[var(--q-text-primary)] rtl:leading-[1.25] rtl:tracking-normal">
            {faq.title}
          </h2>
          <p className="max-w-[42ch] text-[15px] font-medium leading-7 text-[var(--q-text-secondary)]">
            {faq.description}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <Accordion
          defaultValue={["item-0"]}
          className="w-full border-t border-[var(--q-border)]"
        >
          {faq.items.map(([question, answer], index) => (
            <AccordionItem
              key={question}
              value={`item-${index}`}
              className="border-b border-[var(--q-border)] px-0"
            >
              <AccordionTrigger className="gap-6 py-5 text-start text-[15px] font-semibold leading-6 text-[var(--q-text-primary)] hover:no-underline [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-[var(--q-text-muted)]">
                <span className="flex items-baseline gap-4"><small className="w-6 shrink-0 font-mono text-[10px] font-medium text-[var(--q-text-muted)]">0{index + 1}</small>{question}</span>
              </AccordionTrigger>
              <AccordionContent className="max-w-[62ch] pb-5 pl-10 text-[15px] font-normal leading-7 text-[var(--q-text-secondary)] rtl:pl-0 rtl:pr-10">
                <p>{answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </PublicSection>
  );
}
