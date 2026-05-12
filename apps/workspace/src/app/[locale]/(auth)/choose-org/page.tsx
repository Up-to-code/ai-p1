"use client";

import { useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
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
  const brandLabel = isAr ? "عنان" : "anan";
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
    } catch {
      // Fall through to treating the pasted value as a raw token.
    }

    router.push(`/accept-invite?inviteToken=${encodeURIComponent(value)}`);
  }

  return (
    <main className="auth-viewport relative overflow-hidden bg-white px-4 py-5 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(11,92,255,0.18),transparent_34%),radial-gradient(circle_at_82%_84%,rgba(34,197,94,0.13),transparent_30%),linear-gradient(180deg,#fff,rgba(247,249,252,0.94))] dark:bg-[radial-gradient(circle_at_28%_18%,rgba(11,92,255,0.22),transparent_34%),radial-gradient(circle_at_82%_84%,rgba(34,197,94,0.12),transparent_30%),linear-gradient(180deg,#09090b,rgba(9,9,11,0.96))]" />

      <div className="auth-viewport-frame relative z-10 mx-auto flex w-full max-w-7xl flex-col">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-zinc-950 text-white transition group-hover:scale-[1.03] dark:bg-white dark:text-zinc-950">
              <Image src="/brand-logo.svg" alt="Anan" width={22} height={22} className="h-5.5 w-5.5 invert dark:invert-0" priority />
            </span>
            <span className="text-lg font-black tracking-tight text-zinc-950 dark:text-white">
              {brandLabel}
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition hover:border-blue-200 hover:text-zinc-950 dark:border-white/10 dark:bg-white/[0.07] dark:text-zinc-300 dark:shadow-none dark:hover:border-blue-400/30 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {backLabel}
          </Link>
        </div>

        <section className="flex flex-1 items-center justify-center py-10 sm:py-12">
          <div className="w-full max-w-[520px]">
            <div className="space-y-5 rounded-[28px] bg-white/86 p-5 text-start shadow-[0_24px_70px_rgba(11,92,255,0.12),0_10px_35px_rgba(15,23,42,0.08)] ring-1 ring-white/80 backdrop-blur-2xl dark:bg-zinc-900/82 dark:shadow-[0_24px_70px_rgba(11,92,255,0.12)] dark:ring-white/10 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-zinc-950 shadow-[0_10px_25px_rgba(11,92,255,0.18)] dark:bg-white">
                  <Image src="/brand-logo.svg" alt="Anan" width={24} height={24} className="h-6 w-6 invert dark:invert-0" priority />
                </span>
                <div className="min-w-0 space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                    {t("title")}
                  </h1>
                  <p className="text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {t("subtitle")}
                  </p>
                </div>
              </div>

        {/* Option Cards */}
        <div className="grid gap-2.5">
          {hasOrganizations && (
            <Card className="rounded-2xl border-zinc-200 bg-white/75 shadow-none dark:border-white/10 dark:bg-zinc-950/40">
              <CardContent className="space-y-3 p-4">
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{t("existingTitle")}</p>
                {organizations.map((organization) => (
                  <button
                    key={organization.id}
                    type="button"
                    onClick={() => setActiveOrganization(organization.id)}
                    disabled={busy}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl bg-white p-3 text-start text-sm font-bold text-zinc-900 ring-1 ring-zinc-200 transition-colors hover:bg-blue-50/40 disabled:opacity-50 dark:bg-zinc-950 dark:text-white dark:ring-white/10 dark:hover:bg-blue-950/20"
                  >
                      <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 dark:bg-white">
                        {organization.logo ? (
                          // Organization logos can come from dynamic UploadThing hosts.
                          // A plain image avoids coupling auth UI to Next image host config.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={organization.logo} alt="" className="h-6 w-6 object-contain" />
                        ) : (
                          <Image src="/brand-logo.svg" alt="" width={24} height={24} className="h-6 w-6 invert dark:invert-0" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate">{organization.name}</span>
                        <span className="mt-1 block truncate text-[10px] font-semibold text-zinc-400">{organization.slug}</span>
                      </span>
                    </span>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400" /> : <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 rtl:-scale-x-100" />}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Join Organization */}
          <button
            onClick={() => setChoice(choice === "join" ? null : "join")}
            className={cn(
              "w-full cursor-pointer rounded-2xl border bg-white/80 p-4 text-start transition-all duration-300 dark:bg-zinc-950/40",
              choice === "join"
                ? "border-blue-500 ring-4 ring-blue-500/10"
                : "border-zinc-200 hover:border-blue-200 hover:bg-white dark:border-white/10 dark:hover:border-blue-400/30 dark:hover:bg-zinc-900/70"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
                choice === "join" ? "bg-blue-600 text-white shadow-lg shadow-blue-700/20" : "bg-blue-50 text-blue-600 dark:bg-white/5 dark:text-zinc-300"
              )}>
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">{t("joinTitle")}</h3>
                <p className="mt-1 max-w-md text-xs font-medium leading-relaxed text-zinc-500">{t("joinDesc")}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-blue-600 dark:text-blue-300">
                  <Link2 className="h-3.5 w-3.5" />
                  {t("joinCodeLabel")}
                </div>
              </div>
            </div>
          </button>

          {/* Join Expansion */}
          {choice === "join" && (
            <div className="overflow-hidden">
              <Card className="rounded-3xl border border-zinc-200 bg-white/75 dark:border-white/10 dark:bg-zinc-950/40">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="inviteCode" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("joinCodeLabel")}</Label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Link2 className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                          id="inviteCode"
                          value={inviteValue}
                          onChange={(event) => setInviteValue(event.target.value)}
                          placeholder={t("joinCodePlaceholder")}
                          className="h-12 ps-12 rounded-2xl border-zinc-200 bg-white font-medium focus-visible:ring-blue-600/20 dark:border-white/10 dark:bg-[#0A0A0A]"
                        />
                      </div>
                      <Button type="button" onClick={joinFromInvite} disabled={busy} className="h-12 rounded-2xl bg-blue-600 text-white shadow-[0_10px_25px_rgba(11,92,255,0.18)] hover:bg-blue-700 font-black uppercase tracking-widest text-[10px] shrink-0">
                        {t("joinBtn")}
                        <ArrowRight className="ms-2 w-4 h-4 rtl:-scale-x-100" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400">
                    {t("joinHelp")}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Create Organization */}
          <button
            onClick={() => setChoice(choice === "create" ? null : "create")}
            className={cn(
              "w-full cursor-pointer rounded-2xl border bg-white/80 p-4 text-start transition-all duration-300 dark:bg-zinc-950/40",
              choice === "create"
                ? "border-blue-500 ring-4 ring-blue-500/10"
                : "border-zinc-200 hover:border-blue-200 hover:bg-white dark:border-white/10 dark:hover:border-blue-400/30 dark:hover:bg-zinc-900/70"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
                choice === "create" ? "bg-blue-600 text-white shadow-lg shadow-blue-700/20" : "bg-blue-50 text-blue-600 dark:bg-white/5 dark:text-zinc-300"
              )}>
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">{t("createTitle")}</h3>
                <p className="mt-1 max-w-md text-xs font-medium leading-relaxed text-zinc-500">{t("createDesc")}</p>
              </div>
            </div>
          </button>

          {/* Create Expansion */}
          {choice === "create" && (
            <div className="overflow-hidden">
              <Card className="rounded-3xl border border-zinc-200 bg-white/75 dark:border-white/10 dark:bg-zinc-950/40">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="orgName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("createNameLabel")}</Label>
                    <Input
                      id="orgName"
                      value={orgName}
                      onChange={(event) => setOrgName(event.target.value)}
                      placeholder={t("createNamePlaceholder")}
                      className="h-12 rounded-2xl border-zinc-200 bg-white font-medium focus-visible:ring-blue-600/20 dark:border-white/10 dark:bg-[#0A0A0A]"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("createTypeLabel")}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOrgType("broker")}
                        className={cn(
                          "h-12 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all",
                          orgType === "broker" 
                            ? "border-blue-500 ring-4 ring-blue-500/10 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400" 
                            : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.02]"
                        )}
                      >
                        {t("typeBroker")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrgType("developer")}
                        className={cn(
                          "h-12 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all",
                          orgType === "developer" 
                            ? "border-blue-500 ring-4 ring-blue-500/10 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400" 
                            : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.02]"
                        )}
                      >
                        {t("typeDeveloper")}
                      </button>
                    </div>
                  </div>
                  <Button type="button" onClick={createOrganization} disabled={busy} className="h-12 w-full rounded-2xl bg-zinc-900 text-white hover:bg-black font-black uppercase tracking-widest text-[11px] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all active:scale-[0.98]">
                    {busy ? <Loader2 className="me-3 h-4 w-4 animate-spin" /> : <ArrowRight className="ms-3 w-4 h-4 rtl:-scale-x-100" />}
                    {t("createBtn")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
