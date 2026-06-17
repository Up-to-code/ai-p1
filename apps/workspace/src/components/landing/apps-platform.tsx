"use client";

import { ArrowRight, Boxes, Cpu, Handshake } from "lucide-react";
import Image from "next/image";
import { PublicSection } from "@/components/landing/public-landing-kit";
import { Reveal } from "@/components/landing/cinematic-motion";
import { Link } from "@/i18n/routing";
import { Marquee } from "@/components/ui/marquee";
import { BrandMark } from "@/components/logo";

const copy = {
  en: {
    eyebrow: "Apps",
    title: "Your tools, connected to your workspace.",
    description:
      "Install ready-made apps from our catalog, or let your team build custom solutions that read and write your workspace data securely.",

    paths: [
      {
        heading: "Ready-made apps",
        body: "Install approved apps that connect to your workspace. Each app only accesses what you allow, for a limited time, and you can disconnect anytime.",
        cta: "Browse apps",
        href: "/dashboard",
      },
      {
        heading: "Build your own",
        body: "Have a specific need? Register your own app, connect it to your workspace data, and run it privately for your organization.",
        cta: "Start building",
        href: "/partners",
      },
      {
        heading: "Partner program",
        body: "Build a product on top of Qentrah and publish it for every organization. One submission, one review, available to everyone.",
        cta: "Become a partner",
        href: "/partners",
      },
    ],

    works: {
      eyebrow: "Works with",
      title: "The tools your team already uses.",
      description:
        "Connect Claude, ChatGPT, Codex, Cursor, and more directly to your live workspace data. Your AI assistant searches assets, drafts messages, and plans calendar actions without switching tabs.",
      tools: [
        { name: "ChatGPT", url: "https://chatgpt.com" },
        { name: "Claude", url: "https://claude.ai" },
        { name: "Codex", url: "https://openai.com" },
        { name: "Cursor", url: "https://cursor.com" },
        { name: "Gemini", url: "https://gemini.google.com" },
        { name: "GitHub Copilot", url: "https://github.com" },
        { name: "WhatsApp", url: "https://www.whatsapp.com" },
        { name: "Zapier", url: "https://zapier.com" },
        { name: "n8n", url: "https://n8n.io" },
        { name: "Slack", url: "https://slack.com" },
      ],
    },
  },
  ar: {
    eyebrow: "التطبيقات",
    title: "أدواتك تعمل من مساحة واحدة",
    description:
      "اربط تطبيقاتك المفضلة بكانترا، أو ابنِ تكاملات مخصصة لاحتياجك التشغيلي؛ لتعمل بياناتك وعملياتك ضمن منظومة واحدة أكثر أمانًا وكفاءة.",

    paths: [
      {
        heading: "تطبيقات جاهزة",
        body: "فعّل تكاملات معتمدة تربط كانترا بأدواتك اليومية. كل تطبيق يعمل وفق صلاحيات واضحة، ويمكنك إدارته أو إيقافه في أي وقت.",
        cta: "تصفّح التطبيقات",
        href: "/dashboard",
      },
      {
        heading: "ابنِ تطبيقك",
        body: "صمّم تكاملًا خاصًا يناسب طريقة عمل فريقك، واربطه ببيانات مساحة العمل لتشغيل عملياتك وفق احتياجك.",
        cta: "ابدأ البناء",
        href: "/partners",
      },
      {
        heading: "برنامج الشركاء",
        body: "انضم إلى منظومة كانترا واطرح حلولك للفرق والشركات عبر تطبيقات قابلة للتفعيل داخل مساحة العمل.",
        cta: "انضم كشريك",
        href: "/partners",
      },
    ],

    works: {
      eyebrow: "منظومة متصلة",
      title: "كل أدواتك تعمل داخل تدفق واحد",
      description:
        "من الذكاء الاصطناعي إلى الواتساب وأدوات الأتمتة، تضع كانترا تطبيقاتك في مسار تشغيلي موحد؛ لتسريع الإنجاز، تقليل التنقل بين الأدوات، ورفع كفاءة الفريق.",
      tools: [
        { name: "ChatGPT", url: "https://chatgpt.com" },
        { name: "Claude", url: "https://claude.ai" },
        { name: "Codex", url: "https://openai.com" },
        { name: "Cursor", url: "https://cursor.com" },
        { name: "Gemini", url: "https://gemini.google.com" },
        { name: "GitHub Copilot", url: "https://github.com" },
        { name: "واتساب", url: "https://www.whatsapp.com" },
        { name: "Zapier", url: "https://zapier.com" },
        { name: "n8n", url: "https://n8n.io" },
        { name: "سلاك", url: "https://slack.com" },
      ],
    },
  },
};

function ToolPill({ tool }: { tool: { name: string; url: string } }) {
  return (
    <span className="flex h-12 items-center gap-3 rounded-full border border-border bg-[var(--q-card)] px-4 text-sm font-bold text-secondary-foreground shadow-sm dark:border-border dark:bg-muted dark:text-foreground transition-colors duration-200 hover:border-border dark:hover:border-border">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--q-border)] bg-[var(--q-card-hover)] dark:border-border dark:bg-[var(--q-text-primary)]">
        <Image
          alt=""
          width={20}
          height={20}
          unoptimized
          className="h-5 w-5 rounded"
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(tool.url)}&sz=128`}
        />
      </span>
      <span>{tool.name}</span>
    </span>
  );
}

export function AppsPlatform({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;

  const tools = labels.works.tools;
  const half = Math.ceil(tools.length / 2);
  const toolsRow1 = tools.slice(0, half);
  const toolsRow2 = tools.slice(half);

  return (
    <div className="w-full">
      <PublicSection id="apps" tone="default">
        <div className="mx-auto max-w-7xl space-y-16">
          <Reveal>
            <div className="space-y-4 text-start">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-blue-500/30" />
                <BrandMark className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">
                  {labels.eyebrow}
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--q-text-primary)] dark:text-[var(--q-text-primary)] md:text-5xl rtl:leading-[1.3]">
                {labels.title}
              </h2>
              <p className="text-base leading-relaxed text-secondary-foreground dark:text-[var(--q-text-muted)] md:text-lg rtl:leading-[1.8]">
                {labels.description}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-10 md:grid-cols-3 border-t border-border pt-12 dark:border-border">
            {labels.paths.map((path, i) => {
              const Icon = i === 0 ? Boxes : i === 1 ? Cpu : Handshake;
              return (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="group space-y-4 text-start">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted dark:bg-muted text-[var(--q-text-primary)] dark:text-foreground transition-colors duration-300 group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="text-lg font-bold text-[var(--q-text-primary)] dark:text-[var(--q-text-primary)] md:text-xl rtl:leading-[1.3]">
                        {path.heading}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-secondary-foreground dark:text-[var(--q-text-muted)] md:text-base rtl:leading-[1.7]">
                      {path.body}
                    </p>
                    <div>
                      <Link
                        href={path.href}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--q-text-primary)] transition-all duration-300 hover:gap-3 dark:text-[var(--q-text-primary)]"
                      >
                        {path.cta}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="muted" className="border-y border-border dark:border-border overflow-hidden">
        <div className="mx-auto max-w-3xl space-y-10">
          <Reveal>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-emerald-500/30" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-600 dark:text-emerald-400">
                  {labels.works.eyebrow}
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--q-text-primary)] dark:text-[var(--q-text-primary)] md:text-5xl rtl:leading-[1.3]">
                {labels.works.title}
              </h2>
              <p className="text-base leading-relaxed text-secondary-foreground dark:text-[var(--q-text-muted)] md:text-lg rtl:leading-[1.8]">
                {labels.works.description}
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-10 max-w-7xl overflow-hidden md:mt-14">
          <div className="flex flex-col gap-4">
            <Reveal delay={0.1}>
              <div className="flex items-center overflow-hidden">
                <Marquee
                  className="w-full [--duration:28s] [--gap:1rem] [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]"
                  dir="ltr"
                  reverse={isAr}
                  pauseOnHover
                  repeat={4}
                >
                  {toolsRow1.map((tool) => (
                    <ToolPill key={tool.name} tool={tool} />
                  ))}
                </Marquee>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex items-center overflow-hidden">
                <Marquee
                  className="w-full [--duration:32s] [--gap:1rem] [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]"
                  dir="ltr"
                  reverse={!isAr}
                  pauseOnHover
                  repeat={4}
                >
                  {toolsRow2.map((tool) => (
                    <ToolPill key={tool.name} tool={tool} />
                  ))}
                </Marquee>
              </div>
            </Reveal>
          </div>
        </div>
      </PublicSection>

    </div>
  );
}
