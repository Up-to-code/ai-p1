"use client";

import { useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Users, ArrowRight, Link2, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/ui/toast";
import {
  createAndSelectOrganization,
  selectExistingOrganization,
  type AuthResult,
} from "@/domains/auth/organization-selection";
import { writeAuthHandoff } from "@/domains/auth";

type Choice = "join" | "create" | null;
type BetterAuthOrganization = { id: string; name: string; slug: string; logo?: string | null };
type ChooseOrgAuthClient = typeof authClient & {
  organization: {
    create: (input: { name: string; slug: string; metadata?: Record<string, unknown> }) => Promise<AuthResult<BetterAuthOrganization>>;
    setActive: (input: { organizationId: string }) => Promise<AuthResult<BetterAuthOrganization | null>>;
  };
};

const organizationApi = authClient as ChooseOrgAuthClient;
const authVideoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4";

function slugifyOrganizationName(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `org-${Date.now().toString(36)}`;
}

function getAuthError(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  return fallback;
}

export default function ChooseOrgPage() {
  const t = useTranslations("ChooseOrg");
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const { toast } = useToast();
  const [choice, setChoice] = useState<Choice>(null);
  const [orgType, setOrgType] = useState<"broker" | "developer" | null>(null);
  const [orgName, setOrgName] = useState("");
  const [inviteValue, setInviteValue] = useState("");
  const [busy, setBusy] = useState(false);
  const organizationsQuery = authClient.useListOrganizations();
  const organizations = (organizationsQuery.data ?? []) as BetterAuthOrganization[];
  const backLabel = isAr ? "العودة للرئيسية" : "Back to Home";
  const brandLabel = isAr ? "كانترا" : "qentrah";
  const hasOrganizations = organizations.length > 0;

  async function setActiveOrganization(organizationId: string) {
    setBusy(true);
    try {
      await selectExistingOrganization({
        organizationId,
        setActive: organizationApi.organization.setActive,
        navigate: (href, selectedOrganizationId) => {
          writeAuthHandoff(selectedOrganizationId);
          window.location.replace(href);
        },
        nextHref: `/${locale}/dashboard`,
      });
    } catch (error) {
      toast({ title: t("errorTitle"), description: getAuthError(error, t("errorDesc")), type: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function createOrganization() {
    const name = orgName.trim();
    if (!name) {
      toast({ title: t("errorTitle"), description: t("nameRequired"), type: "error" });
      return;
    }

    setBusy(true);
    try {
      await createAndSelectOrganization({
        create: () => organizationApi.organization.create({
          name,
          slug: slugifyOrganizationName(name),
          metadata: { type: orgType ?? "developer", status: "Workspace ready" },
        }),
        setActive: organizationApi.organization.setActive,
        navigate: (href, selectedOrganizationId) => {
          writeAuthHandoff(selectedOrganizationId);
          window.location.replace(href);
        },
        nextHref: `/${locale}/settings/organization`,
      });
    } catch (error) {
      toast({ title: t("errorTitle"), description: getAuthError(error, t("errorDesc")), type: "error" });
    } finally {
      setBusy(false);
    }
  }

  function joinFromInvite() {
    const value = inviteValue.trim();
    if (!value) {
      toast({ title: t("errorTitle"), description: t("inviteRequired"), type: "error" });
      return;
    }

    try {
      const url = value.startsWith("http") ? new URL(value) : new URL(value, window.location.origin);
      const inviteToken = url.searchParams.get("inviteToken");
      const invitationId = url.searchParams.get("invitationId");
      if (inviteToken) {
        router.push(`/accept-invite?inviteToken=${encodeURIComponent(inviteToken)}`);
        return;
      }
      if (invitationId) {
        router.push(`/accept-invite?invitationId=${encodeURIComponent(invitationId)}`);
        return;
      }
    } catch {}

    router.push(`/accept-invite?inviteToken=${encodeURIComponent(value)}`);
  }

  return (
    <main className="min-h-svh overflow-x-hidden bg-[oklch(97.5%_0.006_255)] text-foreground dark:bg-[oklch(8.5%_0.012_255)] lg:grid lg:min-h-screen lg:grid-cols-2">
      <section className={`flex min-h-svh flex-col px-4 py-5 sm:px-8 lg:min-h-screen lg:px-12 lg:py-8 ${isAr ? "lg:[grid-column:2]" : "lg:[grid-column:1]"}`}>
        <div dir="ltr" className="flex items-center justify-start">
          <Link
            href="/"
            dir={isAr ? "rtl" : "ltr"}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[10px] font-black uppercase tracking-[0.12em] text-text-secondary transition hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {backLabel}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[min(500px,calc(100vw-2rem))] min-w-0 space-y-6 text-start">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background">
                <BrandMark className="h-6 w-6" priority />
              </span>
              <span className="text-2xl font-black tracking-tight text-foreground">
                {brandLabel}
              </span>
            </div>
            <div className="mb-8 space-y-3 lg:hidden">
              <h1 className="max-w-[12ch] text-[34px] font-semibold leading-[1.12] tracking-0 text-foreground rtl:leading-[1.2]">
                {t("title")}
              </h1>
              <p className="max-w-sm text-sm font-medium leading-7 text-text-secondary">
                {t("subtitle")}
              </p>
            </div>

            {hasOrganizations ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-text-muted">{t("existingTitle")}</p>
                  <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-bold text-text-secondary">
                    {organizations.length}
                  </span>
                </div>
                <div className="grid gap-2">
                  {organizations.map((organization) => (
                    <button
                      key={organization.id}
                      type="button"
                      onClick={() => setActiveOrganization(organization.id)}
                      disabled={busy}
                      className="group flex w-full items-center justify-between gap-4 rounded-[22px] border border-border bg-surface p-4 text-start text-sm font-bold text-foreground transition-colors hover:border-primary/45 hover:bg-muted disabled:opacity-50"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-background">
                          {organization.logo ? (
                            <Image src={organization.logo} alt="" width={28} height={28} unoptimized className="h-7 w-7 object-contain" />
                          ) : (
                            <BrandMark className="h-6.5 w-6.5" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate">{organization.name}</span>
                          <span className="mt-1 block truncate text-[10px] font-semibold text-text-muted">{organization.slug}</span>
                        </span>
                      </span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-text-muted transition-colors group-hover:border-primary/40 group-hover:text-primary">
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section className={cn("space-y-3", hasOrganizations ? "border-t border-border pt-5" : "")}>
              <button
                onClick={() => setChoice(choice === "join" ? null : "join")}
                className={cn(
                  "w-full cursor-pointer rounded-[22px] border bg-surface p-4 text-start transition-all duration-200",
                  choice === "join"
                    ? "border-primary/55 ring-4 ring-primary/10"
                    : "border-border hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                    choice === "join" ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-background text-text-secondary"
                  )}>
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold tracking-tight text-foreground">{t("joinTitle")}</h2>
                    <p className="mt-1 max-w-md text-xs font-medium leading-6 text-text-secondary">{t("joinDesc")}</p>
                  </div>
                </div>
              </button>

              {choice === "join" ? (
                <div className="space-y-3 rounded-[22px] border border-border bg-background/50 p-4">
                  <Label htmlFor="inviteCode" className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{t("joinCodeLabel")}</Label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <Link2 className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <Input
                        id="inviteCode"
                        value={inviteValue}
                        onChange={(event) => setInviteValue(event.target.value)}
                        placeholder={t("joinCodePlaceholder")}
                        className="h-11 rounded-2xl border-border bg-surface ps-12 font-medium focus-visible:ring-primary/20"
                      />
                    </div>
                    <Button type="button" onClick={joinFromInvite} disabled={busy} className="h-11 shrink-0 rounded-2xl bg-primary text-[10px] font-black uppercase tracking-widest text-primary-foreground hover:bg-primary-hover">
                      {t("joinBtn")}
                      <ArrowRight className="ms-2 h-4 w-4 rtl:-scale-x-100" />
                    </Button>
                  </div>
                </div>
              ) : null}

              <button
                onClick={() => setChoice(choice === "create" ? null : "create")}
                className={cn(
                  "w-full cursor-pointer rounded-[22px] border bg-surface p-4 text-start transition-all duration-200",
                  choice === "create"
                    ? "border-primary/55 ring-4 ring-primary/10"
                    : "border-border hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                    choice === "create" ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-background text-text-secondary"
                  )}>
                    <Building2 className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold tracking-tight text-foreground">{t("createTitle")}</h2>
                    <p className="mt-1 max-w-md text-xs font-medium leading-6 text-text-secondary">{t("createDesc")}</p>
                  </div>
                </div>
              </button>

              {choice === "create" ? (
                <div className="space-y-4 rounded-[22px] border border-border bg-background/50 p-4">
                  <div className="space-y-3">
                    <Label htmlFor="orgName" className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{t("createNameLabel")}</Label>
                    <Input
                      id="orgName"
                      value={orgName}
                      onChange={(event) => setOrgName(event.target.value)}
                      placeholder={t("createNamePlaceholder")}
                      className="h-11 rounded-2xl border-border bg-surface font-medium focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{t("createTypeLabel")}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOrgType("broker")}
                        className={cn(
                          "h-11 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                          orgType === "broker"
                            ? "border-primary bg-surface text-primary ring-4 ring-primary/10"
                            : "border-border text-text-secondary hover:bg-muted"
                        )}
                      >
                        {t("typeBroker")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrgType("developer")}
                        className={cn(
                          "h-11 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                          orgType === "developer"
                            ? "border-primary bg-surface text-primary ring-4 ring-primary/10"
                            : "border-border text-text-secondary hover:bg-muted"
                        )}
                      >
                        {t("typeDeveloper")}
                      </button>
                    </div>
                  </div>
                  <Button type="button" onClick={createOrganization} disabled={busy} className="h-11 w-full rounded-2xl bg-zinc-950 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
                    {busy ? <Loader2 className="me-3 h-4 w-4 animate-spin" /> : <ArrowRight className="ms-3 h-4 w-4 rtl:-scale-x-100" />}
                    {t("createBtn")}
                  </Button>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </section>

      <section className={`relative hidden min-h-screen overflow-hidden bg-[oklch(8.5%_0.012_255)] text-[oklch(96%_0.008_255)] lg:block ${isAr ? "lg:[grid-column:1] lg:[grid-row:1]" : "lg:[grid-column:2] lg:[grid-row:1]"}`}>
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-45"
          loop
          muted
          playsInline
          src={authVideoUrl}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.42) 45%, rgba(0,0,0,0.86) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{
            height: "34%",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
          }}
        />

        <div className="relative z-10 min-h-screen p-10">
          <Link
            href="/"
            dir="ltr"
            className={cn(
              "group absolute top-10 flex w-fit items-center gap-3",
              isAr ? "right-10 flex-row" : "left-10 flex-row-reverse",
            )}
          >
            <span className="text-base font-black tracking-tight">{brandLabel}</span>
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/35 text-white backdrop-blur-xl transition group-hover:bg-black/55">
              <BrandMark className="h-5.5 w-5.5" priority />
            </span>
          </Link>

          <div
            dir={isAr ? "rtl" : "ltr"}
            className={cn(
              "absolute bottom-10 max-w-md pb-6",
              isAr ? "right-10 text-right" : "left-10 text-left",
            )}
          >
            <h1 className={cn("max-w-[11ch] text-5xl font-light leading-none tracking-0 xl:text-6xl rtl:leading-[1.16]", isAr ? "ms-auto" : "")}>
              {t("title")}
            </h1>
            <p className={cn("mt-4 max-w-sm text-sm font-medium leading-7 text-white/68", isAr ? "ms-auto" : "")}>
              {t("subtitle")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
