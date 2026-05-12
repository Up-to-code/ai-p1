import { getContent, type Locale } from "@/lib/content";

export function LegalPage({ locale, kind }: { locale: Locale; kind: "privacy" | "terms" }) {
  const copy = getContent(locale);
  const title = kind === "privacy" ? copy.legal.privacyTitle : copy.legal.termsTitle;
  const blocks = kind === "privacy" ? copy.legal.privacy : copy.legal.terms;

  return (
    <main className="px-5 py-16 md:py-24" dir={locale === "ar" ? "rtl" : "ltr"}>
      <article className="mx-auto max-w-3xl">
        <span className="inline-flex rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-500 dark:border-white/10 dark:text-zinc-300">
          {copy.legal.updated}
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">{title}</h1>
        <p className="mt-5 text-base leading-8 text-zinc-600 dark:text-zinc-300">{copy.legal.intro}</p>
        <div className="mt-10 space-y-8 border-t border-zinc-200 pt-8 dark:border-white/10">
          {blocks.map((block) => (
            <section key={block.title}>
              <h2 className="text-xl font-bold">{block.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{block.body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
