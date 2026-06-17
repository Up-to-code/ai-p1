"use client";

import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AgentItem = {
  name: string;
  url: string;
  desc: {
    en: string;
    ar: string;
  };
};

const agentsList: AgentItem[] = [
  {
    name: "WhatsApp",
    url: "https://www.whatsapp.com",
    desc: {
      en: "Client follow-ups, viewing reminders, and lead replies",
      ar: "متابعة العملاء وتذكير المعاينات والردود على العملاء",
    },
  },
  {
    name: "Slack",
    url: "https://slack.com",
    desc: {
      en: "Team alerts, approvals, and project updates",
      ar: "تنبيهات الفريق والموافقات وتحديثات المشاريع",
    },
  },
  {
    name: "Telegram",
    url: "https://telegram.org",
    desc: {
      en: "Operational messages and fast internal routing",
      ar: "رسائل التشغيل والتوجيه الداخلي السريع",
    },
  },
  {
    name: "Google Sheets",
    url: "https://www.google.com/sheets/about/",
    desc: {
      en: "Inventory imports, reports, and controlled exports",
      ar: "استيراد المخزون والتقارير والتصدير المنظم",
    },
  },
  {
    name: "Airtable",
    url: "https://airtable.com",
    desc: {
      en: "Structured lists, review queues, and team workflows",
      ar: "قوائم منظمة ومراجعات وسير عمل للفريق",
    },
  },
  {
    name: "Notion",
    url: "https://notion.so",
    desc: {
      en: "Briefs, launch notes, and operating playbooks",
      ar: "ملخصات وخطط إطلاق وأدلة تشغيل",
    },
  },
  {
    name: "Zapier",
    url: "https://zapier.com",
    desc: {
      en: "No-code automations between Qentrah and your stack",
      ar: "أتمتة بدون كود بين كانترا وأدواتك",
    },
  },
];

const copy = {
  en: {
    title: "The tools your team uses, connected.",
    description:
      "Keep the tools your team already knows. Qentrah connects them to your live workspace so projects, assets, clients, and calendars stay in sync.",
  },
  ar: {
    title: "أدوات فريقك، متصلة بمنظومة واحدة",
    description:
      "اربط الأدوات التي يعتمد عليها فريقك بكانترا، واجعل المشاريع، الوحدات، العملاء، والمهام تعمل ضمن تدفق واحد يختصر الوقت ويرفع كفاءة التشغيل.",
  },
};

function AgentCard({ agent, isAr }: { agent: AgentItem; isAr: boolean }) {
  const descText = isAr ? agent.desc.ar : agent.desc.en;

  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white p-4 shadow-sm dark:bg-zinc-800 hover:border-[var(--q-user-bubble)]/50 dark:hover:border-[var(--q-user-bubble)]/50 transition duration-300 w-full">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900">
        <Image
          alt=""
          width={20}
          height={20}
          unoptimized
          className="h-5 w-5 rounded"
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(agent.url)}&sz=128`}
        />
      </span>
      <div className="min-w-0 text-start">
        <p className="text-sm font-bold text-[var(--q-text-primary)] dark:text-[var(--q-text-primary)] leading-tight">{agent.name}</p>
        <p className="mt-1 text-[11px] font-medium text-[var(--q-text-muted)] dark:text-zinc-500 leading-normal truncate">{descText}</p>
      </div>
    </div>
  );
}

export function McpAgentsShowcase({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;
  const reduceMotion = useReducedMotion();

  const scrollingAgents = [...agentsList, ...agentsList, ...agentsList, ...agentsList];

  return (
    <section className="w-full overflow-hidden border-y border-zinc-200 dark:border-white/[0.08] bg-[var(--q-bg-secondary)] px-6 py-16 dark:bg-[var(--q-bg-dark)] dark:border-zinc-800 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center" dir={isAr ? "rtl" : "ltr"}>
          <div className="flex flex-col space-y-6 text-start rtl:text-right ltr:text-left max-w-xl mx-auto lg:mx-0">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[var(--q-text-primary)] dark:text-[var(--q-text-primary)] md:text-4xl lg:text-5xl rtl:leading-[1.25]">
              {labels.title}
            </h2>
            <p className="text-base font-semibold leading-relaxed text-zinc-700 dark:text-zinc-300 md:text-lg rtl:leading-[1.7]">
              {labels.description}
            </p>
          </div>

          <div className="w-full flex justify-center">
            <div className="relative h-[380px] w-full max-w-[350px] overflow-hidden rounded-3xl border border-zinc-200/50 bg-zinc-50/20 dark:border-white/[0.05] dark:bg-white/[0.01] p-4 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]">
              <div
                className={cn(
                  "flex flex-col gap-4 w-full h-max py-2",
                  !reduceMotion && "animate-vertical-marquee"
                )}
              >
                {scrollingAgents.map((agent, idx) => (
                  <AgentCard
                    key={`${agent.name}-${idx}`}
                    agent={agent}
                    isAr={isAr}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes mcp-vertical-marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(0, -50%, 0);
          }
        }

        .animate-vertical-marquee {
          animation: mcp-vertical-marquee 32s linear infinite;
        }

        #mcp-agents:hover .animate-vertical-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
