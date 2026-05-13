import { useLocale, useTranslations } from "next-intl";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Link } from "@/i18n/routing";

const navItems = [
  { key: "solutions", href: "/#solutions" },
  { key: "pricing", href: "/#pricing" },
  { key: "resources", href: "/#resources" },
  { key: "company", href: "/about" },
] as const;

export const NavigationSheet = () => {
  const t = useTranslations("Landing.nav");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <Sheet>
      <VisuallyHidden>
        <SheetTitle>{t("home")}</SheetTitle>
      </VisuallyHidden>

      <SheetTrigger render={<Button className="h-10 w-10 rounded-full border-zinc-200 bg-white/80 shadow-none dark:border-white/10 dark:bg-white/10" size="icon" variant="outline" />}>
        <Menu className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent side={isAr ? "right" : "left"} className="w-[min(88vw,340px)] px-6 py-8">
        <Logo />
        <nav className="mt-8 grid gap-2" aria-label={t("home")}>
          {navItems.map((item) => (
            <Link
              className="flex h-12 w-full items-center rounded-xl px-4 text-base font-semibold text-foreground transition hover:bg-muted focus:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              href={item.href}
              key={item.key}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="mt-8 h-px bg-zinc-200 dark:bg-white/10" />
        <div className="mt-6 grid gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {t("dashboard")}
          </Link>
          <div className={cn("flex items-center gap-2", isAr && "flex-row-reverse")}>
            <ThemeToggle className="h-10 w-10 rounded-full border border-zinc-200 bg-white shadow-none dark:border-white/10 dark:bg-white/10" />
            <LanguageSwitcher className="h-10 flex-1 rounded-full border border-zinc-200 bg-white px-3 text-[10px] font-black opacity-80 hover:opacity-100 dark:border-white/10 dark:bg-white/10" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
