"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, LayoutDashboard, RefreshCw } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const isArabic = locale === "ar";

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-var(--topbar-height))] items-center justify-center bg-background px-4 py-10 text-text-primary sm:px-6 lg:px-10">
      <section
        aria-labelledby="app-error-title"
        className="w-full max-w-[720px] overflow-hidden rounded-[24px] border border-border bg-surface text-start shadow-none"
      >
        <div className="border-b border-border bg-background/70 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10 text-danger">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-danger">
                {isArabic ? "تعذر تحميل هذه المساحة" : "Workspace route interrupted"}
              </p>
              <p className="text-[12px] font-medium text-text-muted">
                {isArabic ? "لم يتم فقدان بياناتك." : "Your workspace data has not been changed."}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-6 sm:py-7">
          <h2 id="app-error-title" className="text-[22px] font-bold leading-tight tracking-[0] text-text-primary">
            {isArabic ? "حدث خطأ أثناء فتح الصفحة" : "Something went wrong on this page"}
          </h2>
          <p className="mt-3 max-w-[58ch] text-sm font-medium leading-6 text-text-secondary">
            {isArabic
              ? "يمكنك إعادة المحاولة الآن. إذا استمر الخطأ، افتح لوحة التحكم للعودة إلى مساحة العمل الأساسية."
              : "Try loading this route again. If the problem continues, open the dashboard to return to the stable workspace view."}
          </p>

          {error.digest && (
            <div className="mt-5 rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-[11px] font-bold text-text-muted">{isArabic ? "معرف الخطأ" : "Error ID"}</p>
              <p className="mt-1 break-all font-mono text-xs text-text-secondary">{error.digest}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            <Link href="/ws" className="sm:me-auto">
              <Button variant="outline" className="h-10 w-full gap-2 rounded-xl px-4 text-sm sm:w-auto">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                {isArabic ? "مساحة العمل" : "Workspace"}
              </Button>
            </Link>
            <Button onClick={reset} className="h-10 gap-2 rounded-xl px-4 text-sm shadow-none">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {isArabic ? "إعادة المحاولة" : "Try again"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
