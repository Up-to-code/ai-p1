"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/routing";
import { Bot, CalendarDays, CheckSquare2, ChevronDown, FileText, FolderKanban, Inbox, Menu, Sparkles, Users, X } from "lucide-react";
import { getLocalizedWorkspaceUrl } from "@/lib/workspace-links";
import { isLocale, productUrls } from "@/lib/content";
import { useMarketingContent } from "@/components/marketing/marketing-content-provider";

export function Navbar() {
  const localeRaw = useLocale();
  const locale = isLocale(localeRaw) ? localeRaw : "en";
  const { navigation: nav } = useMarketingContent();
  const signInUrl = getLocalizedWorkspaceUrl(locale, "sign-in");
  const signUpUrl = getLocalizedWorkspaceUrl(locale, "sign-up");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlatformOpen, setIsPlatformOpen] = useState(false);

  const platformItemConfig = [
    { href: "#connected-platform", icon: FolderKanban },
    { href: "#connected-platform", icon: FolderKanban },
    { href: "#connected-platform", icon: CheckSquare2 },
    { href: "#connected-platform", icon: FileText },
    { href: "#connected-platform", icon: Inbox },
    { href: "#connected-platform", icon: CalendarDays },
    { href: "#scoped-agents", icon: Bot },
    { href: "#ai-solutions", icon: Sparkles },
    { href: "#operational-outcomes", icon: Users },
  ] as const;
  const platformItems = platformItemConfig.map((item, index) => ({
    ...item,
    ...nav.platformItems[index],
  }));
  const platformGroups = [
    { title: nav.structure, items: platformItems.slice(0, 3) },
    { title: nav.coordinate, items: platformItems.slice(3, 6) },
    { title: nav.intelligence, items: platformItems.slice(6, 9) },
  ];

  const mobileNavItems = [
    { label: nav.platform, href: "#connected-platform", kind: "anchor" },
    { label: nav.ai, href: "#scoped-agents", kind: "anchor" },
    { label: nav.solutions, href: "#ai-solutions", kind: "anchor" },
    { label: nav.resources, href: "/docs", kind: "route" },
    { label: nav.pricing, href: "/pricing", kind: "route" },
    { label: nav.enterprise, href: productUrls.contact, kind: "external" },
  ] as const;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 48);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 bg-white transition-shadow duration-200", isScrolled && "shadow-[0_8px_30px_rgba(0,0,0,.06)]")} onMouseLeave={() => setIsPlatformOpen(false)}>
      <a href="#scoped-agents" className="hidden h-7 items-center justify-center gap-2 bg-[#F6F7F8] px-4 text-[10px] font-medium text-[#202020] no-underline lg:flex">
        {nav.announcement}<span aria-hidden="true">→</span>
      </a>
      <div className="mx-auto flex h-[64px] w-full max-w-[1220px] items-center gap-7 px-6 lg:px-8">
        <Logo />

        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label={nav.mainNavigation}>
          <button type="button" aria-expanded={isPlatformOpen} onClick={() => setIsPlatformOpen((open) => !open)} onMouseEnter={() => setIsPlatformOpen(true)} className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-[#4d4d4d] transition hover:bg-[#F6F7F8] hover:text-[#202020]">
            {nav.platform}<ChevronDown className="h-3.5 w-3.5" />
          </button>
          <a href="#scoped-agents" className="inline-flex h-10 items-center rounded-lg px-3 text-[13px] font-semibold text-[#4d4d4d] no-underline transition hover:bg-[#F6F7F8] hover:text-[#202020]">{nav.ai}</a>
          <a href="#ai-solutions" className="inline-flex h-10 items-center rounded-lg px-3 text-[13px] font-semibold text-[#4d4d4d] no-underline transition hover:bg-[#F6F7F8] hover:text-[#202020]">{nav.solutions}</a>
          <Link href="/docs" className="inline-flex h-10 items-center rounded-lg px-3 text-[13px] font-semibold text-[#4d4d4d] no-underline transition hover:bg-[#F6F7F8] hover:text-[#202020]">{nav.resources}</Link>
          <Link href="/pricing" className="inline-flex h-10 items-center rounded-lg px-3 text-[13px] font-semibold text-[#4d4d4d] no-underline transition hover:bg-[#F6F7F8] hover:text-[#202020]">{nav.pricing}</Link>
          <a href={productUrls.contact} className="inline-flex h-10 items-center rounded-lg px-3 text-[13px] font-semibold text-[#4d4d4d] no-underline transition hover:bg-[#F6F7F8] hover:text-[#202020]">{nav.enterprise}</a>
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <a href={productUrls.contact} className="hidden h-10 items-center px-3 text-[13px] font-semibold text-[#4d4d4d] transition-colors hover:text-[#202020] md:inline-flex">{nav.sales}</a>
          <a href={signInUrl} className="hidden h-10 items-center rounded-lg bg-[#F6F7F8] px-4 text-[13px] font-semibold text-[#202020] no-underline transition hover:bg-[#eceeef] md:inline-flex">{nav.signIn}</a>
          <a href={signUpUrl} className="hidden h-10 items-center rounded-lg bg-[#202020] px-4 text-[13px] font-semibold text-white no-underline transition hover:bg-[#333] active:scale-[0.98] md:inline-flex">{nav.signUp}</a>
          <button type="button" aria-expanded={isMenuOpen} aria-label={isMenuOpen ? nav.closeMenu : nav.openMenu} onClick={() => setIsMenuOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#F6F7F8] text-[#202020] lg:hidden">
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isPlatformOpen && (
        <div className="absolute inset-x-0 top-full hidden bg-white shadow-[0_18px_36px_rgba(0,0,0,.09)] lg:block">
          <div className="mx-auto grid max-w-[920px] grid-cols-3 gap-16 px-8 py-7">
            {platformGroups.map((group) => (
              <div key={group.title}>
                <p className="mb-3 text-[9px] font-semibold uppercase tracking-[.18em] text-[#8a8a8a]">{group.title}</p>
                <div className="grid gap-1">
                  {group.items.map(({ label, description, href, icon: Icon }) => (
                    <a key={label} href={href} onClick={() => setIsPlatformOpen(false)} className="flex items-start gap-3 rounded-lg px-1 py-2.5 text-[#202020] no-underline transition hover:bg-[#F6F7F8]">
                      <span className="grid h-7 w-7 shrink-0 place-items-center text-[#202020]"><Icon className="h-[18px] w-[18px]" strokeWidth={1.8} /></span>
                      <span className="grid gap-0.5"><strong className="text-[12px] font-semibold">{label}</strong><small className="text-[10px] font-normal leading-4 text-[#737373]">{description}</small></span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="border-t border-[#ececec] bg-white px-5 py-5 shadow-[0_20px_30px_rgba(0,0,0,.08)] lg:hidden">
          <nav className="grid gap-1">
            {mobileNavItems.map((item) => {
              const className = "rounded-lg px-3 py-3 text-sm font-semibold text-[#202020] no-underline hover:bg-[#F6F7F8]";
              if (item.kind === "route") {
                return (
                  <Link key={item.label} href={item.href} onClick={() => setIsMenuOpen(false)} className={className}>
                    {item.label}
                  </Link>
                );
              }

              return (
                <a key={item.label} href={item.href} onClick={() => setIsMenuOpen(false)} className={className}>
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={signInUrl} className="flex h-11 items-center justify-center rounded-lg bg-[#F6F7F8] text-sm font-semibold text-[#202020] no-underline">{nav.signIn}</a>
            <a href={signUpUrl} className="flex h-11 items-center justify-center rounded-lg bg-[#202020] text-sm font-semibold text-white no-underline">{nav.signUp}</a>
          </div>
        </div>
      )}
    </header>
  );
}
