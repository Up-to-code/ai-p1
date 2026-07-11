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
      { question: "À qui s’adresse Qentrah ?", answer: "Qentrah est conçu pour les agences et petites équipes qui pilotent projets, clients, documents, validations et passages de relais dans un même espace fiable." },
      { question: "Comment démarrer ?", answer: "Commencez par un projet et votre équipe. Ajoutez ensuite vos clients, documents et processus à mesure que votre espace prend forme." },
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
      tone="very-dark"
      contentClassName="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:items-start"
    >
      <Reveal>
        <div className="max-w-xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--q-accent)]/25" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/80">
              {eyebrow}
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl rtl:leading-[1.25]">
            {title}
          </h2>
          <p className="text-base font-medium leading-relaxed text-white/70 md:text-lg">
            {description}
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
              className="border-b border-white/10 px-2 transition-colors duration-300 hover:bg-white/5"
            >
              <AccordionTrigger className="text-start py-6 text-base md:text-lg font-semibold text-white transition-all duration-300 hover:text-white/80 hover:no-underline [&_svg]:text-white/50">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-base font-medium text-white/70 leading-relaxed pb-6">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </PublicSection>
  );
}
