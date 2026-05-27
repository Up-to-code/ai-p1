"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard, SearchX } from "lucide-react";
import { useLocale } from "next-intl";

export default function NotFound() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const labels = isAr
    ? {
        eyebrow: "المسار غير متاح",
        helper: "صفحة مساحة العمل المطلوبة غير متاحة.",
        title: "الصفحة غير موجودة",
        description: "قد يكون الرابط قديمًا أو تم نقل الصفحة. افتح لوحة التحكم للمتابعة من مساحة العمل الرئيسية.",
        home: "الرئيسية",
        dashboard: "فتح لوحة التحكم",
      }
    : {
        eyebrow: "Route unavailable",
        helper: "The requested workspace page is not available.",
        title: "Page not found",
        description: "This link may be outdated, or the workspace route may have moved. Open the dashboard to continue from the main operating view.",
        home: "Home",
        dashboard: "Open dashboard",
      };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-text-primary">
      <section
        aria-labelledby="not-found-title"
        className="w-full max-w-3xl text-center"
      >
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-border bg-surface px-4 py-2 text-start">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <SearchX className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[12px] font-bold text-primary">{labels.eyebrow}</p>
            <p className="text-[12px] font-medium text-text-muted">{labels.helper}</p>
          </div>
        </div>

        <p className="mt-10 text-[clamp(5.5rem,18vw,13rem)] font-black leading-[0.82] tracking-0 text-text-primary">
          404
        </p>
        <h1 id="not-found-title" className="mt-8 text-4xl font-semibold leading-tight tracking-0 text-text-primary sm:text-6xl">
          {labels.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-text-secondary">
          {labels.description}
        </p>

        <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button variant="outline" className="h-12 w-full gap-2 rounded-full px-6 text-sm sm:w-auto">
              <Home className="h-4 w-4" aria-hidden="true" />
              {labels.home}
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="h-12 w-full gap-2 rounded-full px-6 text-sm shadow-none sm:w-auto">
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              {labels.dashboard}
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
