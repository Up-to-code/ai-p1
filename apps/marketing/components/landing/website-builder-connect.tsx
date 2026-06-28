"use client";

import { PlugZap } from "lucide-react";
import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";

type ToolBrand = {
  name: string;
  url: string;
};

const builderToolsRow1: ToolBrand[] = [
  { name: "Claude AI", url: "https://claude.ai" },
  { name: "v0.dev", url: "https://v0.dev" },
  { name: "Replit", url: "https://replit.com" },
  { name: "Bolt.new", url: "https://bolt.new" },
  { name: "Lovable", url: "https://lovable.dev" },
  { name: "Cursor", url: "https://cursor.com" },
  { name: "Figma", url: "https://figma.com" },
];

const builderToolsRow2: ToolBrand[] = [
  { name: "Framer", url: "https://framer.com" },
  { name: "Webflow", url: "https://webflow.com" },
  { name: "Wix Studio", url: "https://wix.com/studio" },
  { name: "Squarespace", url: "https://squarespace.com" },
  { name: "Typedream", url: "https://typedream.com" },
  { name: "Dorik", url: "https://dorik.com" },
  { name: "Softr", url: "https://softr.io" },
];

const copy = {
  en: {
    eyebrow: "Website builders",
    title: "Build anywhere. Connect to Qentrah.",
    description: "Use Claude, v0, Replit, Bolt, or your current website. Share your workspace ID and API key, and your assets, clients, and forms sync.",
  },
  ar: {
    eyebrow: "منشئ المواقع",
    title: "ابنِ واجهتك بأي أداة، واربطها بكانترا",
    description: "استخدم أدوات بناء المواقع التي تفضلها، واربطها بمساحة عملك في كانترا عبر واجهات API؛ لتعرض المشاريع، الأصول، والعملاء من مصدر واحد ومحدّث دائمًا.",
  },
};

function ToolPill({ tool }: { tool: ToolBrand }) {
  return (
    <span className="flex h-12 items-center gap-3 rounded-full border border-[var(--q-border)] bg-[var(--q-card)] px-4 text-sm font-bold text-[var(--q-text-secondary)] shadow-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--q-border)] bg-[var(--q-bg-secondary)]">
        <Image
          alt=""
          width={20}
          height={20}
          unoptimized
          className="h-5 w-5"
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(tool.url)}&sz=128`}
        />
      </span>
      <span>{tool.name}</span>
    </span>
  );
}

export function WebsiteBuilderConnect({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;

  return (
    <section className="w-full overflow-hidden border-y border-[var(--q-border)] bg-[var(--q-bg-secondary)] px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex max-w-4xl flex-col items-start space-y-5 text-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--q-accent)]/20 bg-[var(--q-accent)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--q-accent)]">
            <PlugZap className="h-3.5 w-3.5" />
            {labels.eyebrow}
          </div>
          <h2 className="max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-tight text-[var(--q-text-primary)] rtl:leading-[1.16]">
            {labels.title}
          </h2>
          <p className="max-w-2xl text-base font-semibold leading-relaxed text-[var(--q-text-secondary)] md:text-lg">
            {labels.description}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl overflow-hidden md:mt-14">
        <div className="flex flex-col gap-4">
          <div className="flex items-center overflow-hidden">
            <Marquee
              className="w-full [--duration:38s] [--gap:1rem] [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]"
              dir="ltr"
              reverse={isAr}
              pauseOnHover
              repeat={4}
            >
              {builderToolsRow1.map((tool) => (
                <ToolPill key={tool.name} tool={tool} />
              ))}
            </Marquee>
          </div>

          <div className="flex items-center overflow-hidden">
            <Marquee
              className="w-full [--duration:42s] [--gap:1rem] [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]"
              dir="ltr"
              reverse={!isAr}
              pauseOnHover
              repeat={4}
            >
              {builderToolsRow2.map((tool) => (
                <ToolPill key={tool.name} tool={tool} />
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  );
}
