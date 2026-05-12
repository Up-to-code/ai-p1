import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getContent, type Locale } from "@/lib/content";

export function LegalPage({ locale, kind }: { locale: Locale; kind: "privacy" | "terms" }) {
  const copy = getContent(locale);
  const title = kind === "privacy" ? copy.legal.privacyTitle : copy.legal.termsTitle;
  const blocks = kind === "privacy" ? copy.legal.privacy : copy.legal.terms;

  return (
    <main className="px-5 py-16 md:py-24" dir={locale === "ar" ? "rtl" : "ltr"}>
      <article className="mx-auto max-w-3xl">
        <Badge variant="outline">{copy.legal.updated}</Badge>
        <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">{title}</h1>
        <p className="mt-5 text-base leading-8 text-zinc-600 dark:text-zinc-300">{copy.legal.intro}</p>
        <Card className="mt-10">
          <CardContent className="space-y-8 p-6 md:p-8">
            {blocks.map((block) => (
              <section key={block.title}>
                <h2 className="text-xl font-bold">{block.title}</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{block.body}</p>
              </section>
            ))}
          </CardContent>
        </Card>
      </article>
    </main>
  );
}
