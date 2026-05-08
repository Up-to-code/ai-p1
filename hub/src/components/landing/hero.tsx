import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Database,
  FileCheck2,
  GitMerge,
  Landmark,
  RadioTower,
  ShieldCheck,
  Triangle,
} from "lucide-react";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("Landing.hero");

  const sourceNodes = [
    { icon: Building2, label: t("sourceDevelopers"), meta: t("sourceClaims"), position: "start-3 top-8 md:start-6 md:top-10" },
    { icon: Database, label: t("sourceCrms"), meta: t("sourceInventory"), position: "end-3 top-8 md:end-6 md:top-10" },
    { icon: Landmark, label: t("sourceRegistry"), meta: t("sourceEvidence"), position: "start-0 bottom-24 md:start-4 md:bottom-28" },
    { icon: RadioTower, label: t("sourceChannels"), meta: t("sourceDistribution"), position: "end-0 bottom-24 md:end-4 md:bottom-28" },
  ];

  const hubStages = [
    { label: t("stageClaim"), tone: "bg-blue-500" },
    { label: t("stageApproval"), tone: "bg-amber-500" },
    { label: t("stageCanonical"), tone: "bg-success" },
    { label: t("stageVisibility"), tone: "bg-slate-500" },
  ];

  return (
    <section className="w-full overflow-hidden border-b border-border/40 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_58%,#ffffff_100%)] px-6 pb-12 pt-24 md:px-12 md:pb-16 md:pt-28">
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="max-w-3xl text-start">
          <Link
            href="/docs"
            className="mb-7 inline-flex items-center gap-2 rounded-md border border-border/70 bg-white px-3 py-1.5 text-sm font-medium text-text-secondary shadow-none transition-colors hover:border-border hover:text-text-primary"
          >
            <span className="h-2 w-2 rounded-full bg-success" />
            {t("badge")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>

          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.08] tracking-normal text-text-primary md:text-6xl lg:text-7xl">
            {t("title")}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-text-secondary md:text-lg">
            {t("description")}
          </p>

          <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              { label: t("statOne"), value: t("statOneValue") },
              { label: t("statTwo"), value: t("statTwoValue") },
              { label: t("statThree"), value: t("statThreeValue") },
            ].map((item) => (
              <div key={item.label} className="border-s border-border/70 ps-4">
                <p className="text-sm font-semibold text-text-primary">{item.value}</p>
                <p className="mt-1 text-xs leading-5 text-text-muted">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 w-full px-7 text-base font-semibold sm:w-auto">
                {t("openWorkspace")}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full border-border/70 bg-background px-7 text-base font-semibold text-text-primary sm:w-auto"
              >
                {t("readDocs")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative min-h-[430px] w-full overflow-hidden rounded-lg border border-border/70 bg-white shadow-none md:min-h-[520px]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="absolute inset-x-8 top-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="absolute inset-x-8 bottom-28 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="absolute inset-0">
            <svg className="h-full w-full text-border" viewBox="0 0 720 520" fill="none" aria-hidden="true">
              <path d="M134 98 C232 132 270 180 360 260" stroke="currentColor" strokeWidth="1.5" strokeDasharray="7 8" />
              <path d="M586 98 C488 132 450 180 360 260" stroke="currentColor" strokeWidth="1.5" strokeDasharray="7 8" />
              <path d="M112 384 C212 350 264 314 360 260" stroke="currentColor" strokeWidth="1.5" strokeDasharray="7 8" />
              <path d="M608 384 C508 350 456 314 360 260" stroke="currentColor" strokeWidth="1.5" strokeDasharray="7 8" />
              <path d="M360 304 C360 358 360 382 360 424" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          {sourceNodes.map((node) => {
            const Icon = node.icon;

            return (
              <div
                key={node.label}
                className={`absolute ${node.position} w-[150px] rounded-md border border-border/70 bg-white/95 p-2.5 shadow-none backdrop-blur md:w-[168px] md:p-3`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 ring-1 ring-border/70">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-text-primary">{node.label}</p>
                    <p className="truncate text-[11px] text-text-muted">{node.meta}</p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="absolute left-1/2 top-[49%] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-slate-950 p-4 text-white shadow-none md:top-[47%] md:w-[300px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-slate-950">
                  <Triangle className="h-4 w-4 fill-current" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t("core")}</p>
                  <p className="text-xs text-white/55">{t("coreMeta")}</p>
                </div>
              </div>
              <span className="rounded-md bg-success/15 px-2 py-1 text-[11px] font-semibold text-success">
                {t("liveSync")}
              </span>
            </div>

            <div className="mt-4 grid gap-2">
              {hubStages.map((stage) => (
                <div key={stage.label} className="flex items-center justify-between rounded-md bg-white/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${stage.tone}`} />
                    <span className="text-xs font-medium text-white/80">{stage.label}</span>
                  </div>
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 w-[min(560px,calc(100%-32px))] -translate-x-1/2 rounded-md border border-border/70 bg-white/95 p-2.5 shadow-none backdrop-blur md:bottom-5 md:p-3">
            <div className="grid gap-2 grid-cols-3">
              {[
                { icon: ShieldCheck, label: t("outcomeVerified"), meta: t("outcomeVerifiedMeta") },
                { icon: FileCheck2, label: t("outcomeAudit"), meta: t("outcomeAuditMeta") },
                { icon: GitMerge, label: t("outcomeDistributed"), meta: t("outcomeDistributedMeta") },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex min-w-0 items-center gap-1.5 rounded-md bg-surface px-2 py-2 md:gap-2 md:px-2.5">
                    <Icon className="h-4 w-4 shrink-0 text-success" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold leading-4 text-text-primary md:truncate md:text-xs">
                        {item.label}
                      </p>
                      <p className="hidden truncate text-[11px] text-text-muted md:block">{item.meta}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
