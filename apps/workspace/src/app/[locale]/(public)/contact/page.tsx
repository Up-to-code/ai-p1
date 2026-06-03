import { Mail, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { publicPageMetadata } from "@/lib/seo/public-pages";
import { ContactFormClient } from "./contact-form-client";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return publicPageMetadata(locale, "contact");
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing.contact" });

  return (
    <main className="bg-white px-6 py-28 dark:bg-zinc-950 md:py-32">
      <section className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-5xl rtl:leading-[1.14]">
            {t("hero.title")}
          </h1>
          <p className="mt-5 max-w-md text-sm font-medium leading-7 text-zinc-600 dark:text-zinc-400">
            {t("hero.description")}
          </p>

          <div className="mt-8 space-y-3">
            <a
              className="flex items-center gap-3 text-sm font-bold text-zinc-950 transition hover:text-blue-700 dark:text-white dark:hover:text-blue-300"
              href="mailto:hello@qentrah.com"
            >
              <Mail className="h-4 w-4" />
              hello@qentrah.com
            </a>
            <a
              className="flex items-center gap-3 text-sm font-bold text-zinc-950 transition hover:text-blue-700 dark:text-white dark:hover:text-blue-300"
              href="tel:+966110000000"
            >
              <Phone className="h-4 w-4" />
              +966 11 XXX XXXX
            </a>
          </div>
        </div>

        <ContactFormClient
          copy={{
            eyebrow: t("form.eyebrow"),
            name: t("form.name"),
            email: t("form.email"),
            team: t("form.team"),
            topic: t("form.topic"),
            message: t("form.message"),
            submit: t("form.submit"),
          }}
        />
      </section>
    </main>
  );
}
