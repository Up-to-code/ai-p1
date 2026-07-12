"use client";

import { useLocale, useTranslations } from "next-intl";

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
  const locale = useLocale();
  const t = useTranslations("Landing.home.faq");
  const french = {
    eyebrow: "QUESTIONS FRÉQUENTES",
    title: "Avant d’installer votre équipe.",
    description: "Des réponses claires pour évaluer Qentrah comme espace de travail commun.",
    items: [
      { question: "À qui s’adresse Qentrah ?", answer: "Qentrah est conçu pour les équipes qui veulent organiser espaces, projets, tâches, documents et opérations dans un environnement commun." },
      { question: "Comment démarrer ?", answer: "Créez une organisation, ajoutez un espace pour votre équipe, puis structurez vos projets, tâches et documents à mesure que le travail évolue." },
      { question: "Plusieurs équipes peuvent-elles partager les mêmes données ?", answer: "Oui. Les espaces et projets donnent à chacun le contexte dont il a besoin, avec des rôles et des autorisations adaptés." },
      { question: "Comment fonctionne la tarification ?", answer: "Vous pouvez commencer gratuitement. Les formules publiées couvrent les besoins croissants, et les organisations plus complexes peuvent nous contacter." },
      { question: "Comment Qentrah protège-t-il le contexte de travail ?", answer: "Les rôles, autorisations et limites d’organisation, d’espace et de projet s’appliquent aux personnes, aux agents et aux intégrations." },
    ] satisfies FaqItem[],
  };
  const items = locale === "fr" ? french.items : t.raw("items") as FaqItem[];
  const eyebrow = locale === "fr" ? french.eyebrow : t("eyebrow");
  const title = locale === "fr" ? french.title : t("title");
  const description = locale === "fr" ? french.description : t("description");

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
              {eyebrow}
            </span>
          </div>
          <h2 className="max-w-[16ch] text-[clamp(2.35rem,3.6vw,3.55rem)] font-medium leading-[1.04] tracking-[-0.04em] text-balance text-[var(--q-text-primary)] rtl:leading-[1.25] rtl:tracking-normal">
            {title}
          </h2>
          <p className="max-w-[42ch] text-[15px] font-medium leading-7 text-[var(--q-text-secondary)]">
            {description}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <Accordion
          defaultValue={["item-0"]}
          className="w-full border-t border-[var(--q-border)]"
        >
          {items.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
              className="border-b border-[var(--q-border)] px-0"
            >
              <AccordionTrigger className="gap-6 py-5 text-start text-[15px] font-semibold leading-6 text-[var(--q-text-primary)] hover:no-underline [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-[var(--q-text-muted)]">
                <span className="flex items-baseline gap-4"><small className="w-6 shrink-0 font-mono text-[10px] font-medium text-[var(--q-text-muted)]">0{index + 1}</small>{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="max-w-[62ch] pb-5 pl-10 text-[15px] font-normal leading-7 text-[var(--q-text-secondary)] rtl:pl-0 rtl:pr-10">
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </PublicSection>
  );
}
