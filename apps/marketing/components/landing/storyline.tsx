"use client";

import { useTranslations } from "next-intl";
import { SectionKicker } from "./public-page-shell";

type StoryItem = {
  title: string;
  description: string;
};

export function Storyline() {
  const t = useTranslations("Landing.about.story");
  const items = t.raw("items") as StoryItem[];

  return (
    <section className="px-6 py-20 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <SectionKicker center>{t("eyebrow")}</SectionKicker>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-6xl">
            {t("title")}
          </h2>
        </div>

        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent dark:before:via-white/10 md:before:mx-auto md:before:ml-auto">
          {items.map((item, index) => (
            <div key={item.title} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              {/* Dot */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:border-blue-500/50 dark:border-white/10 dark:bg-zinc-900 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>

              {/* Content */}
              <div className="ml-10 w-[calc(100%-4rem)] rounded-[2rem] border border-zinc-100 bg-zinc-50/50 p-6 transition-all duration-500 hover:border-zinc-200 hover:bg-white hover:shadow-xl dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-white/10 dark:hover:bg-white/[0.04] md:ml-0 md:w-[45%] md:p-8">
                <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-7 text-zinc-600 dark:text-zinc-400 md:text-base md:leading-8">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
