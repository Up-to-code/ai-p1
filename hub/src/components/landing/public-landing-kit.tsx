import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, Bot, Building2, CalendarClock, CheckCircle2, CircleAlert, FileCheck2, Home, MessageSquareText, Search, ShieldCheck, UsersRound, Wifi } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "amber" | "red" | "zinc";

const toneClassName: Record<Tone, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  zinc: "bg-zinc-400",
};

export function PublicSection({
  children,
  className,
  contentClassName,
  tone = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  tone?: "default" | "muted" | "inverse";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "px-4 py-16 sm:px-6 md:py-24",
        tone === "default" && "bg-black text-white",
        tone === "muted" && "bg-[#050505] text-white",
        tone === "inverse" && "bg-white text-zinc-950",
        className
      )}
    >
      <div className={cn("mx-auto max-w-[1400px]", contentClassName)}>{children}</div>
    </section>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  className,
  align = "start",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <div className={cn("space-y-4", align === "center" && "mx-auto max-w-3xl text-center", className)}>
      <div className={cn("flex items-center gap-3", align === "center" && "justify-center")}>
        <span className="h-px w-8 bg-white/15" />
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-300/80">{eyebrow}</span>
      </div>
      <h2 className="text-3xl font-semibold leading-none tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-sm font-medium leading-relaxed text-zinc-400 md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export function LandingButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "inverse";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest transition active:scale-[0.98]",
        variant === "primary" && "bg-white text-zinc-950 hover:bg-zinc-200",
        variant === "secondary" && "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
        variant === "inverse" && "bg-zinc-950 text-white hover:bg-zinc-800",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function SignalCard({
  label,
  value,
  helper,
  tone = "zinc",
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  tone?: Tone;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4 text-start">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">{label}</p>
          <p className="mt-2 text-xs font-medium leading-relaxed text-zinc-400">{helper}</p>
        </div>
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-zinc-300" /> : <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", toneClassName[tone])} />}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

export function WorkspacePreview({ labels }: { labels: WorkspacePreviewLabels }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[#080808] text-start shadow-[0_40px_120px_rgba(120,140,255,0.18)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-zinc-950">
            <Home className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-black lowercase tracking-tight text-white">anan</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{labels.workspace}</p>
          </div>
        </div>
        <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
          <span className="rounded-full bg-white px-3 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-950">{labels.work}</span>
          <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-400">{labels.ai}</span>
        </div>
      </div>

      <div className="grid gap-px bg-white/10 md:grid-cols-4">
        <PreviewMetric label={labels.activeListings} value="248" icon={Building2} />
        <PreviewMetric label={labels.pendingApprovals} value="18" icon={FileCheck2} />
        <PreviewMetric label={labels.qualifiedLeads} value="1.2k" icon={UsersRound} />
        <PreviewMetric label={labels.syncHealth} value="99%" icon={Wifi} />
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4 border-white/10 p-4 lg:border-e">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{labels.actionRequired}</p>
            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-200">
              {labels.today}
            </span>
          </div>
          {labels.tasks.map((task, index) => (
            <div key={task.title} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  {index === 1 ? <CircleAlert className="h-4 w-4 text-amber-500" /> : <CheckCircle2 className="h-4 w-4 text-zinc-400" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-white">{task.title}</p>
                  <p className="mt-1 truncate text-[10px] font-bold text-zinc-500">{task.meta}</p>
                </div>
              </div>
              <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest", index === 1 ? "bg-amber-500/10 text-amber-200" : "bg-emerald-500/10 text-emerald-200")}>
                {task.status}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-4 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{labels.assistant}</p>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-3">
            <p className="px-2 pt-2 text-sm font-medium leading-relaxed text-zinc-300">{labels.prompt}</p>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-black p-2">
              <div className="flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <Bot className="h-3.5 w-3.5" />
                {labels.ready}
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-950">
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {labels.chips.map((chip) => (
              <div key={chip} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                {chip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewMetric({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="flex h-24 flex-col justify-between bg-[#080808] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-[8px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
        <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-300" />
      </div>
      <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

export function AudiencePanel({
  eyebrow,
  title,
  description,
  href,
  image,
  stats,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  image: string;
  stats: Array<{ label: string; value: string }>;
}) {
  return (
    <Link href={href} className="group grid overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035] transition hover:border-white/25 md:grid-cols-[0.9fr_1.1fr]">
      <div className="relative min-h-[240px] overflow-hidden bg-white/5">
        <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 520px" className="object-cover opacity-80 grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/60">{eyebrow}</p>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-8 p-6 md:p-8">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-white md:text-4xl">{title}</h3>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-zinc-400">{description}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/[0.045] p-3">
              <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{stat.label}</p>
              <p className="mt-1 truncate text-sm font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function WorkflowList({ items }: { items: Array<{ title: string; description: string; icon: LucideIcon }> }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5 text-start">
            <div className="mb-8 flex items-center justify-between">
              <Icon className="h-5 w-5 text-zinc-400" />
              <span className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-white">{item.title}</h3>
            <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-400">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
}

export function CtaPanel({
  eyebrow,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  secondaryHref = "/contact",
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHref?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.16),transparent_34%),#050505] p-6 text-white md:p-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-white/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-300">{eyebrow}</span>
          </div>
          <h2 className="text-3xl font-semibold leading-none tracking-tight md:text-5xl">{title}</h2>
          <p className="text-sm font-medium leading-relaxed text-zinc-400 md:text-base">{description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <LandingButton href="/dashboard" variant="inverse">{primaryLabel}</LandingButton>
          <LandingButton href={secondaryHref} variant="secondary" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            {secondaryLabel}
          </LandingButton>
        </div>
      </div>
    </div>
  );
}

export function ContactMethod({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
      <div className="mb-8 flex items-center justify-between">
        <Icon className="h-5 w-5 text-zinc-400" />
        <span className="h-2 w-2 rounded-full bg-blue-500" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{label}</p>
      <p className="mt-2 text-lg font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-400">{helper}</p>
    </div>
  );
}

export const defaultWorkflowIcons = {
  search: Search,
  shield: ShieldCheck,
  message: MessageSquareText,
  calendar: CalendarClock,
};

export interface WorkspacePreviewLabels {
  workspace: string;
  work: string;
  ai: string;
  activeListings: string;
  pendingApprovals: string;
  qualifiedLeads: string;
  syncHealth: string;
  actionRequired: string;
  today: string;
  assistant: string;
  prompt: string;
  ready: string;
  tasks: Array<{ title: string; meta: string; status: string }>;
  chips: string[];
}
