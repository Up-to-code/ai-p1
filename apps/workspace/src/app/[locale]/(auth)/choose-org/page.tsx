"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { BrandMark } from "@/components/logo";
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
    } catch {
      // Fall through to treating the pasted value as a raw token.
    }

    router.push(`/accept-invite?inviteToken=${encodeURIComponent(value)}`);
  }

  return (
    <main className="auth-viewport bg-background px-4 py-5 text-foreground sm:px-6">
      <div className="auth-viewport-frame mx-auto flex w-full max-w-7xl flex-col">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface text-foreground transition group-hover:bg-muted">
              <BrandMark className="h-5.5 w-5.5" priority />
            </span>
            <span className="text-lg font-black tracking-tight text-foreground">
              {brandLabel}
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[10px] font-black uppercase tracking-[0.12em] text-text-secondary transition hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {backLabel}
          </Link>
        </div>

        <section className="flex flex-1 items-center justify-center py-10 sm:py-12">
          <div className="w-full max-w-[500px]">
            <div className="space-y-5 rounded-[24px] border border-border bg-surface p-5 text-start sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background">
                  <BrandMark className="h-5.5 w-5.5" priority />
                </span>
                <div className="min-w-0 space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {t("title")}
                  </h1>
                  <p className="text-sm leading-6 text-text-secondary">
                    {t("subtitle")}
                  </p>
                </div>
              </div>

              {/* Option Cards */}
              <div className="grid gap-3">
                {hasOrganizations && (
                  <div className="rounded-[22px] border border-border bg-background p-3">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">{t("existingTitle")}</p>
                      <span className="rounded-full border border-border bg-surface px-2 py-1 text-[10px] font-bold text-text-secondary">
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
                          className="group flex w-full items-center justify-between gap-4 rounded-[18px] border border-border bg-surface p-3 text-start text-sm font-bold text-foreground transition-colors hover:border-primary/40 hover:bg-muted disabled:opacity-50"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-background">
                              {organization.logo ? (
                                // Organization logos can come from dynamic UploadThing hosts.
                                // A plain image avoids coupling auth UI to Next image host config.
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={organization.logo} alt="" className="h-7 w-7 object-contain" />
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
                  </div>
                )}

          {/* Join Organization */}
          <button
            onClick={() => setChoice(choice === "join" ? null : "join")}
            className={cn(
              "w-full cursor-pointer rounded-2xl border bg-background p-4 text-start transition-all duration-300",
              choice === "join"
                ? "border-primary bg-surface ring-4 ring-primary/10"
                : "border-border hover:bg-muted"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
                choice === "join" ? "bg-primary text-primary-foreground" : "border border-border bg-surface text-text-secondary"
              )}>
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold tracking-tight text-foreground">{t("joinTitle")}</h3>
                <p className="mt-1 max-w-md text-xs font-medium leading-relaxed text-text-secondary">{t("joinDesc")}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-primary">
                  <Link2 className="h-3.5 w-3.5" />
                  {t("joinCodeLabel")}
                </div>
              </div>
            </div>
          </button>

          {/* Join Expansion */}
          {choice === "join" && (
            <div className="overflow-hidden">
              <Card className="rounded-2xl border border-border bg-background shadow-none">
                <CardContent className="space-y-5 p-5">
                  <div className="space-y-3">
                    <Label htmlFor="inviteCode" className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{t("joinCodeLabel")}</Label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Link2 className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
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
                        <ArrowRight className="ms-2 w-4 h-4 rtl:-scale-x-100" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-text-muted">
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
              "w-full cursor-pointer rounded-2xl border bg-background p-4 text-start transition-all duration-300",
              choice === "create"
                ? "border-primary bg-surface ring-4 ring-primary/10"
                : "border-border hover:bg-muted"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
                choice === "create" ? "bg-primary text-primary-foreground" : "border border-border bg-surface text-text-secondary"
              )}>
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold tracking-tight text-foreground">{t("createTitle")}</h3>
                <p className="mt-1 max-w-md text-xs font-medium leading-relaxed text-text-secondary">{t("createDesc")}</p>
              </div>
            </div>
          </button>

          {/* Create Expansion */}
          {choice === "create" && (
            <div className="overflow-hidden">
              <Card className="rounded-2xl border border-border bg-background shadow-none">
                <CardContent className="space-y-5 p-5">
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
                          "h-11 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition-all",
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
                          "h-11 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition-all",
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
