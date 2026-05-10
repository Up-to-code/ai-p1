"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const CTA = () => {
  const t = useTranslations("Landing.home.cta");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section className="px-0 py-20 sm:px-6 md:py-28">
      <div className="relative mx-auto w-full overflow-hidden border-y border-zinc-200 bg-zinc-950 shadow-2xl shadow-zinc-950/10 dark:border-white/10 sm:w-[90vw] sm:max-w-[1440px] sm:rounded-3xl sm:border">
        <Image
          alt=""
          aria-hidden="true"
          className="absolute inset-0 object-cover opacity-70"
          fill
          priority={false}
          sizes="(max-width: 640px) 100vw, 90vw"
          src="/vectors/landing/cta_signal_texture.svg"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(11,92,255,0.38),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.96),rgba(0,0,0,0.68)_54%,rgba(0,0,0,0.48))] rtl:bg-[radial-gradient(circle_at_82%_18%,rgba(11,92,255,0.38),transparent_34%),linear-gradient(270deg,rgba(0,0,0,0.96),rgba(0,0,0,0.68)_54%,rgba(0,0,0,0.48))]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

        <div className="relative isolate px-6 py-14 sm:px-10 md:px-14 md:py-16">
          <p className="mb-5 text-[10px] font-black uppercase tracking-[0.34em] text-blue-200">
            {t("eyebrow")}
          </p>
          <h2
            className={cn(
              "max-w-3xl text-4xl font-bold text-white sm:text-5xl md:text-6xl",
              isAr ? "leading-[1.18]" : "leading-[0.95] tracking-tight",
            )}
          >
            {t("title")}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            {t("description")}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-zinc-950 ring-4 ring-white/20 transition hover:bg-zinc-200"
              href="/dashboard"
            >
              {t("primary")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-7 text-sm font-bold text-white transition hover:bg-white/15"
              href="/contact"
            >
              {t("secondary")}
              <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
