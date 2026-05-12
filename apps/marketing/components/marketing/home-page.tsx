import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Code2,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";

import { getContent, type Locale } from "@/lib/content";

const productIcons = {
  workspace: Building2,
  partners: Code2
};

const principles = {
  en: [
    {
      title: "Workspace-first data",
      description: "Organizations manage people, properties, clients, projects, and daily work from the main workspace.",
      icon: Workflow
    },
    {
      title: "Partner access by consent",
      description: "Approved partners connect through OAuth and scoped APIs instead of direct database access.",
      icon: ShieldCheck
    },
    {
      title: "One brand system",
      description: "Public pages, product surfaces, and developer flows share one Anan identity and policy layer.",
      icon: Network
    }
  ],
  ar: [
    {
      title: "البيانات تبدأ من مساحة العمل",
      description: "تدير المؤسسات الأشخاص والعقارات والعملاء والمشاريع والعمل اليومي من مساحة العمل الرئيسية.",
      icon: Workflow
    },
    {
      title: "وصول الشركاء بالموافقة",
      description: "يتصل الشركاء المعتمدون عبر OAuth وواجهات API محددة الصلاحيات بدلا من الوصول المباشر لقاعدة البيانات.",
      icon: ShieldCheck
    },
    {
      title: "نظام علامة واحد",
      description: "تتشارك الصفحات العامة وتجارب المنتج وتدفقات المطورين هوية أنان وطبقة السياسات نفسها.",
      icon: Network
    }
  ]
};

function buttonClass(variant: "primary" | "secondary" | "dark" = "primary") {
  if (variant === "secondary") {
    return "inline-flex h-14 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-8 text-[15px] font-bold text-zinc-950 backdrop-blur-xl transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10";
  }

  if (variant === "dark") {
    return "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100";
  }

  return "inline-flex h-14 items-center justify-center gap-2 rounded-full bg-zinc-950 px-8 text-[15px] font-bold text-white shadow-2xl shadow-zinc-900/20 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200";
}

function ProductPreview({ isAr }: { isAr: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/75 p-4 shadow-2xl shadow-zinc-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
      <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-950 p-4 text-white dark:border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">Anan Workspace</p>
            <h2 className="mt-2 text-2xl font-bold">{isAr ? "مكتب اليوم" : "Today desk"}</h2>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">
            {isAr ? "جاهز" : "Ready"}
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            [isAr ? "العملاء" : "Clients", "184"],
            [isAr ? "العقارات" : "Properties", "72"],
            [isAr ? "المهام" : "Tasks", "29"]
          ].map(([label, value]) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4" key={label}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{label}</p>
              <p className="mt-4 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold">{isAr ? "تكامل شريك معتمد" : "Approved partner integration"}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                {isAr ? "وصول مؤسسي محدد الصلاحيات عبر OAuth." : "Scoped organization access through OAuth."}
              </p>
            </div>
            <Code2 className="size-8 text-blue-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const isAr = locale === "ar";
  const principleCopy = principles[locale];

  return (
    <main className="flex-1" dir={isAr ? "rtl" : "ltr"}>
      <section className="relative overflow-hidden border-b border-zinc-200/70 pb-20 pt-28 dark:border-white/[0.08] md:pb-24 md:pt-32">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(ellipse_at_top,rgba(11,92,255,0.24),transparent_66%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(11,92,255,0.34),transparent_68%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(11,92,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(11,92,255,0.05)_1px,transparent_1px)] bg-[size:80px_80px] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_80%)] dark:opacity-20" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-12 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full border border-zinc-200 bg-white/60 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-blue-600 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-blue-300">
              {copy.home.eyebrow}
            </span>
            <h1 className="mt-6 text-[clamp(2.5rem,8vw,5.5rem)] font-bold leading-[0.95] tracking-tighter text-zinc-950 dark:text-white rtl:leading-[1.25] rtl:tracking-normal">
              {copy.home.title}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-xl">{copy.home.description}</p>
            <div className="mt-10 flex w-full flex-col gap-5 sm:w-auto sm:flex-row">
              <a className={buttonClass()} href={copy.products[0].href}>
                {copy.home.primaryCta}
                <ArrowRight className={isAr ? "size-4 rotate-180" : "size-4"} />
              </a>
              <a className={buttonClass("secondary")} href={copy.products[1].href}>
                {copy.home.secondaryCta}
              </a>
            </div>
          </div>
          <ProductPreview isAr={isAr} />
        </div>
      </section>

      <section className="w-full border-b border-zinc-200/70 px-6 py-12 dark:border-white/[0.08] md:py-16">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
          {[
            [isAr ? "مساحة العمل" : "Workspace", isAr ? "التشغيل" : "Operations"],
            [isAr ? "الشركاء" : "Partners", isAr ? "التكاملات" : "Integrations"],
            [isAr ? "التفويض" : "Authorization", isAr ? "على مستوى المؤسسة" : "Organization-level"]
          ].map(([label, value]) => (
            <div className="rounded-[22px] border border-zinc-200 bg-white/60 p-5 text-start dark:border-white/10 dark:bg-white/[0.045]" key={label}>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">{label}</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 md:py-32" id="products">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-zinc-200 dark:bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-300">
                {isAr ? "منتجات أنان العامة" : "Anan public products"}
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-bold leading-none tracking-tight text-zinc-900 dark:text-white md:text-5xl">
              {isAr ? "نفس نظام أنان، بواجهات واضحة." : "One Anan system, clear product doors."}
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-base">
              {isAr
                ? "يعرض الموقع العام المنتجات التي يستخدمها العملاء والمطورون مباشرة، بدون أدوات داخلية أو تطبيقات عرض."
                : "The public site shows only the products customers and developers can use directly, without internal review tools or demo apps."}
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {copy.products.map((product) => {
              const Icon = productIcons[product.id];
              return (
                <article className="h-full overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/70 p-8 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]" key={product.id}>
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                      <Icon className="size-6" />
                    </span>
                    <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-bold text-zinc-500 dark:border-white/10 dark:text-zinc-300">{product.status}</span>
                  </div>
                  <h3 className="text-2xl font-bold">{product.name}</h3>
                  <p className="mt-3 text-base leading-7 text-zinc-500 dark:text-zinc-400">{product.description}</p>
                  <ul className="mt-6 space-y-3">
                    {product.bullets.map((bullet) => (
                      <li className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300" key={bullet}>
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-300" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <a className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-zinc-200 px-7 text-sm font-bold text-zinc-950 transition hover:bg-zinc-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10" href={product.href}>
                    {product.cta}
                    <ArrowUpRight className="size-4 rtl:-rotate-90" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-5 py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.34em] text-blue-200">
              {isAr ? "مبنية حول التفويض" : "Built around authorization"}
            </p>
            <h2 className="text-4xl font-bold sm:text-5xl md:text-6xl">
              {isAr ? "نفس منطق مساحة العمل، للعلامة العامة." : "The same workspace logic, for the public brand."}
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {principleCopy.map((principle) => {
              const Icon = principle.icon;
              return (
                <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-white" key={principle.title}>
                  <Icon className="mb-4 size-7" />
                  <h3 className="text-lg font-bold">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{principle.description}</p>
                </article>
              );
            })}
          </div>
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.06] p-8">
            <Sparkles className="mb-5 size-8 text-blue-200" />
            <p className="max-w-2xl text-sm leading-7 text-zinc-300">
              {isAr
                ? "هذه الصفحة هي المدخل العام فقط. مساحة العمل تبقى مكان التشغيل، وبوابة الشركاء تبقى مكان المطورين والتكاملات."
                : "This page is only the public front door. Workspace remains the operating product, and Partners remains the developer and integration portal."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link className={buttonClass("dark")} href={`/${locale}/privacy`}>
                {copy.nav.privacy}
              </Link>
              <Link className={buttonClass("dark")} href={`/${locale}/terms`}>
                {copy.nav.terms}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
