"use client";

import { useRef } from "react";
import { ArrowLeft, Check, Play, Sparkles, Star } from "lucide-react";
import { ReviewInput } from "@/components/shared";
import type { PartnerCatalogApp } from "../store/integrations.types";
import type { IntegrationAppDetails } from "../lib/integration-app-details";
import type { IntegrationDetailLabels } from "../lib/integration-detail-labels";

export function IntegrationDetailMain({
  app,
  mockDetails,
  labels,
  accountUser,
  isMutating,
  onReviewSubmit,
  onOpenMedia,
  t,
}: {
  app: PartnerCatalogApp;
  mockDetails: IntegrationAppDetails;
  labels: IntegrationDetailLabels;
  accountUser: { name: string; image: string | null; initials: string };
  isMutating: boolean;
  onReviewSubmit: () => Promise<void>;
  onOpenMedia: (media: "video" | "screenshot") => void;
  t: ((key: string, values?: Record<string, string | number>) => string) & { raw: (key: string) => unknown };
}) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -480 : 480,
      behavior: "smooth",
    });
  };

  const screenshotTitle = t("detail.appDetails.default.screenshotTitle", { name: app.name }).includes("{name}")
    ? t("detail.appDetails.default.screenshotTitle", { name: app.name }).replace("{name}", app.name)
    : t("detail.appDetails.default.screenshotTitle", { name: app.name });

  return (
    <div className="space-y-0 divide-y divide-border dark:divide-white/[0.04]">
      <section className="py-6 space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{labels.overview}</h2>
        <div className="space-y-3 text-xs leading-relaxed text-muted-foreground text-start">
          <p className="font-semibold text-foreground/40">{mockDetails.valueProp}</p>
          <p>{app.description}</p>
        </div>
      </section>

      <section className="py-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{labels.permissionsTitle}</h2>
          <p className="text-xs font-medium leading-relaxed text-muted-foreground">{labels.permissionsDescription}</p>
        </div>
        <ul className="divide-y divide-border overflow-hidden rounded-[14px] border border-border/80 bg-white dark:divide-white/[0.05] dark:border-white/[0.06] dark:bg-white/[0.02]">
          {mockDetails.scopesExplained.map((scopeItem) => (
            <li key={scopeItem.scope} className="flex gap-3 p-4 text-start">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-foreground/30">{scopeItem.scope}</span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground dark:border-white/[0.08]">
                    {labels.policyStatus}
                  </span>
                </div>
                <p className="text-xs font-medium leading-relaxed text-muted-foreground">{scopeItem.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-6 space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-muted-foreground/60" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{screenshotTitle}</h2>
          </div>
          <div className="flex items-center gap-1.5" dir="ltr">
            <button
              onClick={() => scrollCarousel("left")}
              className="h-7 w-7 rounded-full border border-border/80 bg-white hover:bg-muted/50 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:bg-white/[0.04] flex items-center justify-center text-muted-foreground active:scale-95 transition"
              title="Scroll Left"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => scrollCarousel("right")}
              className="h-7 w-7 rounded-full border border-border/80 bg-white hover:bg-muted/50 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:bg-white/[0.04] flex items-center justify-center text-muted-foreground active:scale-95 transition"
              title="Scroll Right"
            >
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            </button>
          </div>
        </div>

        <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border dark:scrollbar-thumb-border" dir="ltr">
          <div
            onClick={() => onOpenMedia("video")}
            className="group relative aspect-video w-[280px] sm:w-[460px] shrink-0 snap-center rounded-[14px] border border-border/80 bg-foreground dark:border-white/[0.06] overflow-hidden flex flex-col justify-between p-4 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-0 group-hover:from-black/95 transition-all duration-300" />
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="h-12 w-12 rounded-full bg-white/10 dark:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Play className="h-5 w-5 fill-white ms-0.5" />
              </div>
            </div>
            <div className="z-10 flex justify-between items-start">
              <span className="rounded bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold text-white tracking-wide">
                {labels.videoTitle}
              </span>
              <span className="rounded bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono text-white">
                {mockDetails.videoDuration}
              </span>
            </div>
            <div className="z-10 space-y-2 text-start">
              <h3 className="text-xs font-semibold text-white truncate drop-shadow-sm">{mockDetails.videoTitle}</h3>
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                <div className="flex-1 h-1 bg-white/25 rounded overflow-hidden">
                  <div className="w-1/3 h-full bg-muted-foreground" />
                </div>
                <span>0:00 / {mockDetails.videoDuration}</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => onOpenMedia("screenshot")}
            className="aspect-video w-[280px] sm:w-[460px] shrink-0 snap-center rounded-[14px] overflow-hidden border border-border/80 dark:border-white/[0.06] shadow-sm bg-foreground cursor-pointer hover:opacity-95 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mockDetails.screenshotImgUrl} alt="" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-xs pt-1 select-none text-start">
          <span>💻</span>
          <span className="font-semibold">{t("detail.appStoreGrid.compatVal")}</span>
        </div>
      </section>

      <section className="py-6 space-y-6">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{t("detail.reviews.title")}</h2>
          <span className="text-xs font-semibold text-muted-foreground">{t("detail.reviews.reviewsCount")}</span>
        </div>

        <div className="grid gap-6 md:grid-cols-[160px_1fr] items-center">
          <div className="flex flex-col items-center justify-center text-center p-4 rounded-[12px] bg-muted/50 dark:bg-white/[0.005] border border-border dark:border-white/[0.03]">
            <span className="text-4xl font-extrabold tracking-tight text-foreground">{t("detail.reviews.ratingValue")}</span>
            <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">{t("detail.reviews.outOf")}</span>
            <div className="flex items-center gap-0.5 text-amber-500 mt-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </div>
          </div>

          <div className="space-y-2 text-start">
            {[
              { stars: 5, pct: "92%" },
              { stars: 4, pct: "6%" },
              { stars: 3, pct: "2%" },
              { stars: 2, pct: "0%" },
              { stars: 1, pct: "0%" },
            ].map((row) => (
              <div key={row.stars} className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-0.5 w-12 text-muted-foreground shrink-0">
                  <span className="font-bold text-foreground/40 w-3 text-end">{row.stars}</span>
                  <Star className="h-3 w-3 fill-current text-amber-500" />
                </div>
                <div className="flex-1 h-2 rounded bg-muted dark:bg-white/[0.04] overflow-hidden">
                  <div className="h-full bg-amber-500 rounded" style={{ width: row.pct }} />
                </div>
                <span className="w-8 text-[10px] text-muted-foreground font-mono text-end shrink-0">{row.pct}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          {(t.raw("detail.reviews.items") as { title: string; author: string; time: string; rating: number; comment: string }[]).map((review, idx) => (
            <div key={idx} className="flex flex-col justify-between p-4 rounded-[12px] bg-muted/50/50 dark:bg-white/[0.005] border border-border dark:border-white/[0.03] space-y-3">
              <div className="space-y-1.5 text-start">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground/30 line-clamp-1">{review.title}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{review.time}</span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-muted-foreground/30 dark:text-foreground"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium pt-1 line-clamp-3">{review.comment}</p>
              </div>
              <div className="pt-2 border-t border-border/50 dark:border-white/[0.02] text-start">
                <span className="text-[10px] font-semibold text-muted-foreground">{review.author}</span>
              </div>
            </div>
          ))}
        </div>

        <ReviewInput
          user={accountUser}
          onSubmit={onReviewSubmit}
          isLoading={isMutating}
          placeholder={t("detail.reviews.placeholder")}
          submitLabel={t("detail.reviews.submit")}
          title={t("detail.reviews.writeTitle")}
        />
      </section>
    </div>
  );
}
