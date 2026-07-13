import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, SearchX } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-text-primary">
      <section
        aria-labelledby="not-found-title"
        className="w-full max-w-3xl text-center"
      >
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-border bg-surface px-4 py-2 text-start">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-text-primary/20 bg-text-primary/10 text-text-primary">
            <SearchX className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[12px] font-bold text-text-primary">{t("eyebrow")}</p>
            <p className="text-[12px] font-medium text-text-muted">{t("helper")}</p>
          </div>
        </div>

        <p className="mt-10 text-[clamp(5.5rem,18vw,13rem)] font-black leading-[0.82] tracking-0 text-text-primary">
          404
        </p>
        <h1 id="not-found-title" className="mt-8 text-4xl font-semibold leading-tight tracking-0 text-text-primary sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-text-secondary">
          {t("description")}
        </p>

        <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <Link href="/ws">
            <Button className="h-12 w-full gap-2 rounded-full px-6 text-sm shadow-none sm:w-auto">
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              {t("dashboard")}
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
