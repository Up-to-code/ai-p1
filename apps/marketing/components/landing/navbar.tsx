"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Link } from "@/i18n/routing";
import { ArrowRight, Menu, X } from "lucide-react";
import { publicSeoLinks } from "@/lib/public-links";

export function Navbar() {
  const t = useTranslations("Landing.nav");
  const locale = useLocale() === "ar" ? "ar" : "en";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 48);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex flex-col">

      {/* ── Main bar ─────────────────────────────────────────────────
          At rest  : full-width, fully transparent, no pill
          Scrolled : shrinks to a centred pill with blurred background
      ──────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "mx-auto w-full flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isScrolled
            ? "mt-3 max-w-4xl rounded-2xl border px-4 py-2.5 shadow-[0_8px_40px_rgba(0,0,0,0.09)]"
            : "max-w-none px-6 py-5 sm:px-10",
        )}
        style={
          isScrolled
            ? {
                background: "color-mix(in srgb, var(--q-card) 90%, transparent)",
                borderColor: "var(--q-border)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }
            : undefined
        }
      >
        {/* Logo */}
        <Logo />

        {/* Desktop nav — centred links */}
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {publicSeoLinks.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[var(--q-text-secondary)] transition-colors duration-150 hover:text-[var(--q-text-primary)]"
            >
              {item.labels[locale]}
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">

          {/* Theme + language (desktop) */}
          <div className="hidden items-center gap-1 sm:flex">
            <ThemeToggle
              className={cn(
                "h-8 w-8 rounded-lg border-none shadow-none",
                isScrolled
                  ? "bg-transparent hover:bg-[var(--q-card-hover)]"
                  : "bg-transparent hover:bg-[var(--q-card)]/50",
              )}
            />
            <LanguageSwitcher
              className={cn(
                "h-8 min-w-[4.5rem] rounded-lg border-none px-2.5 text-[11px] font-bold opacity-70",
                "bg-transparent text-[var(--q-text-secondary)] hover:opacity-100",
                isScrolled
                  ? "hover:bg-[var(--q-card-hover)]"
                  : "hover:bg-[var(--q-card)]/50",
              )}
            />
          </div>

          {/* Sign in CTA (desktop) */}
          <Link
            href="/dashboard"
            className={cn(
              "hidden h-9 items-center gap-1.5 rounded-xl px-4 text-[11px] font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.97] md:inline-flex",
              isScrolled
                ? "bg-[var(--q-accent)] text-background hover:bg-[var(--q-accent-hover)]"
                : "bg-[var(--q-text-primary)] text-background hover:opacity-85",
            )}
          >
            {t("signIn")}
            <ArrowRight className="h-3 w-3 rtl:rotate-180" />
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
            onClick={() => setIsMenuOpen((o) => !o)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors md:hidden",
              isScrolled
                ? "border-[var(--q-border)] bg-[var(--q-card)] text-[var(--q-text-primary)]"
                : "border-[var(--q-border)]/40 bg-[var(--q-card)]/50 text-[var(--q-text-primary)] backdrop-blur-sm",
            )}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      {isMenuOpen && (
        <div
          className="mx-3 mt-1 rounded-2xl border p-3 shadow-[0_16px_48px_rgba(0,0,0,0.12)] md:hidden"
          style={{
            background: "color-mix(in srgb, var(--q-card) 96%, transparent)",
            borderColor: "var(--q-border)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* Nav links */}
          <nav className="grid gap-0.5" aria-label="Mobile navigation">
            {publicSeoLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex h-10 w-full items-center rounded-xl px-4 text-[13px] font-semibold text-[var(--q-text-primary)] transition-colors hover:bg-[var(--q-card-hover)]"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.labels[locale]}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div
            className="mt-2 space-y-2 border-t pt-2"
            style={{ borderColor: "var(--q-border)" }}
          >
            <Link
              href="/dashboard"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--q-accent)] text-[11px] font-black uppercase tracking-widest text-background transition-all active:scale-[0.98]"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("signIn")}
              <ArrowRight className="h-3 w-3 rtl:rotate-180" />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle className="h-9 w-9 rounded-xl border border-[var(--q-border)] bg-[var(--q-card)] shadow-none" />
              <LanguageSwitcher className="h-9 flex-1 rounded-xl border border-[var(--q-border)] bg-[var(--q-card)] px-3 text-[11px] font-bold text-[var(--q-text-secondary)]" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
