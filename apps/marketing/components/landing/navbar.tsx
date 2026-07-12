"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/routing";
import { Bot, CalendarDays, CheckSquare2, ChevronDown, FileText, FolderKanban, Inbox, Menu, Sparkles, Users, X } from "lucide-react";
import { getLocalizedWorkspaceUrl } from "@/lib/workspace-links";
import { marketingNav, isLocale, productUrls } from "@/lib/content";

export function Navbar() {
  const localeRaw = useLocale();
  const locale = isLocale(localeRaw) ? localeRaw : "en";
  const nav = marketingNav[locale];
  const signInUrl = getLocalizedWorkspaceUrl(locale, "sign-in");
  const signUpUrl = getLocalizedWorkspaceUrl(locale, "sign-up");
  const signUpLabel = locale === "ar" ? "ابدأ مجاناً" : locale === "fr" ? "Commencer" : "Start free";
  const salesLabel = locale === "ar" ? "تحدث إلى المبيعات" : locale === "fr" ? "Demander une démo" : "Talk to sales";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlatformOpen, setIsPlatformOpen] = useState(false);

  const labels = locale === "ar"
    ? { announcement: "جديد: وكلاء ذكاء يعملون داخل سياق مساحة عملك", platform: "المنصة", ai: "وكلاء الذكاء", solutions: "الحلول", resources: "المصادر", pricing: "التسعير", enterprise: "للمؤسسات", explore: "استكشف المنصة", structure: "نظّم العمل", coordinate: "نسّق الفريق", intelligence: "الذكاء والسياق" }
    : locale === "fr"
      ? { announcement: "Nouveau : des agents IA qui travaillent dans le contexte de votre espace", platform: "Plateforme", ai: "Agents IA", solutions: "Solutions", resources: "Ressources", pricing: "Tarifs", enterprise: "Entreprise", explore: "Découvrir la plateforme", structure: "Structurer le travail", coordinate: "Coordonner l’équipe", intelligence: "IA et contexte" }
      : { announcement: "NEW: Scoped AI agents that work inside your workspace context", platform: "Platform", ai: "AI Agents", solutions: "Solutions", resources: "Resources", pricing: "Pricing", enterprise: "Enterprise", explore: "Explore the platform", structure: "Structure work", coordinate: "Coordinate teams", intelligence: "AI and context" };

  const platformGroups = [
    { title: labels.structure, items: [{ label: "Spaces", description: "Organize teams and related work", href: "#connected-platform", icon: FolderKanban }, { label: "Projects", description: "Plan outcomes, owners, and progress", href: "#connected-platform", icon: FolderKanban }, { label: "Tasks", description: "Move work from idea to done", href: "#connected-platform", icon: CheckSquare2 }] },
    { title: labels.coordinate, items: [{ label: "Docs", description: "Keep knowledge beside the work", href: "#connected-platform", icon: FileText }, { label: "Inbox", description: "See updates that need attention", href: "#connected-platform", icon: Inbox }, { label: "Calendar", description: "Coordinate time and deadlines", href: "#connected-platform", icon: CalendarDays }] },
    { title: labels.intelligence, items: [{ label: "Scoped AI agents", description: "Delegate work within permissions", href: "#scoped-agents", icon: Bot }, { label: "Automations", description: "Run repeatable workflows", href: "#ai-solutions", icon: Sparkles }, { label: "Permissions", description: "Control access at every level", href: "#operational-outcomes", icon: Users }] },
  ];

  const mobileNavItems = [
    { label: labels.platform, href: "#connected-platform", kind: "anchor" },
    { label: labels.ai, href: "#scoped-agents", kind: "anchor" },
    { label: labels.solutions, href: "#ai-solutions", kind: "anchor" },
    { label: labels.resources, href: "/docs", kind: "route" },
    { label: labels.pricing, href: "/pricing", kind: "route" },
    { label: labels.enterprise, href: productUrls.contact, kind: "external" },
  ] as const;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 48);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 bg-white transition-shadow duration-200", isScrolled && "shadow-[0_8px_30px_rgba(0,0,0,.06)]")} onMouseLeave={() => setIsPlatformOpen(false)}>
      <a href="#scoped-agents" className="hidden h-7 items-center justify-center gap-2 bg-[#F6F7F8] px-4 text-[10px] font-medium text-[#202020] no-underline lg:flex">
        {labels.announcement}<span aria-hidden="true">→</span>
      </a>
      <div className="mx-auto flex h-[64px] w-full max-w-[1220px] items-center gap-7 px-6 lg:px-8">
        <Logo />

        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Main navigation">
          <button type="button" aria-expanded={isPlatformOpen} onClick={() => setIsPlatformOpen((open) => !open)} onMouseEnter={() => setIsPlatformOpen(true)} className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-[#4d4d4d] transition hover:bg-[#F6F7F8] hover:text-[#202020]">
            {labels.platform}<ChevronDown className="h-3.5 w-3.5" />
          </button>
          <a href="#scoped-agents" className="inline-flex h-10 items-center rounded-lg px-3 text-[13px] font-semibold text-[#4d4d4d] no-underline transition hover:bg-[#F6F7F8] hover:text-[#202020]">{labels.ai}</a>
          <a href="#ai-solutions" className="inline-flex h-10 items-center rounded-lg px-3 text-[13px] font-semibold text-[#4d4d4d] no-underline transition hover:bg-[#F6F7F8] hover:text-[#202020]">{labels.solutions}</a>
          <Link href="/docs" className="inline-flex h-10 items-center rounded-lg px-3 text-[13px] font-semibold text-[#4d4d4d] no-underline transition hover:bg-[#F6F7F8] hover:text-[#202020]">{labels.resources}</Link>
          <Link href="/pricing" className="inline-flex h-10 items-center rounded-lg px-3 text-[13px] font-semibold text-[#4d4d4d] no-underline transition hover:bg-[#F6F7F8] hover:text-[#202020]">{labels.pricing}</Link>
          <a href={productUrls.contact} className="inline-flex h-10 items-center rounded-lg px-3 text-[13px] font-semibold text-[#4d4d4d] no-underline transition hover:bg-[#F6F7F8] hover:text-[#202020]">{labels.enterprise}</a>
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <a href={productUrls.contact} className="hidden h-10 items-center px-3 text-[13px] font-semibold text-[#4d4d4d] transition-colors hover:text-[#202020] md:inline-flex">{salesLabel}</a>
          <a href={signInUrl} className="hidden h-10 items-center rounded-lg bg-[#F6F7F8] px-4 text-[13px] font-semibold text-[#202020] no-underline transition hover:bg-[#eceeef] md:inline-flex">{nav.signIn}</a>
          <a href={signUpUrl} className="hidden h-10 items-center rounded-lg bg-[#202020] px-4 text-[13px] font-semibold text-white no-underline transition hover:bg-[#333] active:scale-[0.98] md:inline-flex">{signUpLabel}</a>
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
            <a href={signUpUrl} className="flex h-11 items-center justify-center rounded-lg bg-[#202020] text-sm font-semibold text-white no-underline">{signUpLabel}</a>
          </div>
        </div>
      )}
    </header>
  );
}
