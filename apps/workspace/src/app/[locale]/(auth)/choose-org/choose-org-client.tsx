"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowRight, Building2, ChevronLeft, Link2, Loader2, Users } from "lucide-react";
import { BrandMark } from "@/components/logo";
import { WorkOSLogoutButton } from "@/components/auth/workos-logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Link, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Choice = "join" | "create" | null;

type UserOrganization = {
  organizationId: string;
  workosOrganizationId: string;
  name: string;
  role?: string;
  roles: string[];
};

type OrganizationsResponse = {
  ok: boolean;
  activeWorkosOrganizationId?: string | null;
  organizations?: UserOrganization[];
};

async function fetchOrganizations() {
  const response = await fetch("/api/auth/workos/organizations", { cache: "no-store" });
  if (response.status === 401) {
    return { isSignedIn: false, activeWorkosOrganizationId: null, organizations: [] };
  }
  const payload = await response.json().catch(() => ({})) as OrganizationsResponse;
  if (!response.ok || !payload.ok) {
    return { isSignedIn: false, activeWorkosOrganizationId: null, organizations: [] };
  }
  return {
    isSignedIn: true,
    activeWorkosOrganizationId: payload.activeWorkosOrganizationId ?? null,
    organizations: payload.organizations ?? [],
  };
}

export function ChooseOrgClient({ locale }: { locale: string }) {
  const t = useTranslations("ChooseOrg");
  const router = useRouter();
  const { toast } = useToast();
  const isAr = locale === "ar";
  const [choice, setChoice] = useState<Choice>("create");
  const [orgType, setOrgType] = useState<"broker" | "developer">("broker");
  const [inviteValue, setInviteValue] = useState("");
  const organizationsQuery = useQuery({
    queryKey: ["workos-organizations"],
    queryFn: fetchOrganizations,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
  const isSignedIn = organizationsQuery.data?.isSignedIn ?? false;
  const activeWorkosOrganizationId = organizationsQuery.data?.activeWorkosOrganizationId ?? null;
  const organizations = organizationsQuery.data?.organizations ?? [];
  const hasOrganizations = organizations.length > 0;
  const visibleChoice = hasOrganizations && choice === "create" ? null : choice;
  const backLabel = isAr ? "العودة للرئيسية" : "Back to Home";
  const brandLabel = isAr ? "كانترا" : "qentrah";

  useEffect(() => {
    if (!organizationsQuery.isPending && !isSignedIn) {
      router.replace(`/sign-in?returnTo=${encodeURIComponent(`/${locale}/choose-org`)}`);
      return;
    }

    if (activeWorkosOrganizationId) {
      router.replace("/dashboard");
    }
  }, [activeWorkosOrganizationId, isSignedIn, locale, organizationsQuery.isPending, router]);

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

  function continueToOrganization(workosOrganizationId: string) {
    if (workosOrganizationId === activeWorkosOrganizationId) {
      router.replace("/dashboard");
      return;
    }

    const params = new URLSearchParams({
      returnTo: `/${locale}/dashboard`,
      organizationId: workosOrganizationId,
    });
    window.location.assign(`/sign-in?${params.toString()}`);
  }

  return (
    <main className="min-h-svh overflow-x-hidden bg-[oklch(97.5%_0.006_255)] text-foreground dark:bg-[oklch(8.5%_0.012_255)]">
      <section className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 py-5 sm:px-8 lg:px-10 lg:py-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              dir={isAr ? "rtl" : "ltr"}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-xs font-bold text-text-secondary transition hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              {backLabel}
            </Link>
            <WorkOSLogoutButton compact />
          </div>

          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
              <BrandMark className="h-5 w-5" priority />
            </span>
            <span className="text-sm font-black tracking-tight text-foreground">{brandLabel}</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="w-full max-w-[520px] min-w-0 text-start">
            <div className="mb-8 space-y-3">
              <h1 className="max-w-[13ch] text-[38px] font-semibold leading-[1.08] tracking-0 text-foreground sm:text-[44px] rtl:leading-[1.2]">
                {t("title")}
              </h1>
              <p className="max-w-md text-sm font-medium leading-7 text-text-secondary">{t("subtitle")}</p>
            </div>

            <section className="rounded-[24px] border border-border bg-surface p-3 shadow-none sm:p-4">
              {organizationsQuery.isPending ? (
                <div className="flex items-center gap-3 rounded-[18px] border border-transparent p-4 text-sm font-medium text-text-secondary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isAr ? "جار تحميل مساحات العمل..." : "Loading workspaces..."}
                </div>
              ) : (
                <>
                  {hasOrganizations ? (
                    <div className="space-y-2">
                      <div className="px-2 pb-1">
                        <h2 className="text-sm font-bold tracking-tight text-foreground">{t("existingTitle")}</h2>
                      </div>
                      {organizations.map((organization) => (
                        <button
                          key={organization.organizationId}
                          type="button"
                          onClick={() => continueToOrganization(organization.workosOrganizationId)}
                          className="flex w-full cursor-pointer items-center gap-4 rounded-[18px] border border-border bg-background/60 p-4 text-start transition hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-black text-primary">
                            {organization.name.trim().slice(0, 1).toUpperCase() || "Q"}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold tracking-tight text-foreground">
                              {organization.name}
                            </span>
                            <span className="mt-1 block text-xs font-medium leading-5 text-text-secondary">
                              {organization.role ?? organization.roles[0] ?? (isAr ? "مساحة عمل" : "Workspace")}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-text-secondary rtl:-scale-x-100" />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setChoice(choice === "join" ? null : "join")}
                    className={cn(
                      "w-full cursor-pointer rounded-[18px] border p-4 text-start transition-all duration-200",
                      hasOrganizations ? "mt-3" : "",
                      visibleChoice === "join" ? "border-primary/55 bg-primary/5 ring-4 ring-primary/10" : "border-transparent bg-transparent hover:bg-muted",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                        visibleChoice === "join" ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-background text-text-secondary",
                      )}>
                        <Users className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-bold tracking-tight text-foreground">{t("joinTitle")}</h2>
                        <p className="mt-1 max-w-md text-xs font-medium leading-6 text-text-secondary">{t("joinDesc")}</p>
                      </div>
                    </div>
                  </button>

                  {visibleChoice === "join" ? (
                    <div className="mx-1 mb-3 space-y-3 rounded-[18px] border border-border bg-background/60 p-4">
                      <Label htmlFor="inviteCode" className="text-xs font-bold text-text-secondary">
                        {t("joinCodeLabel")}
                      </Label>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                          <Link2 className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                          <Input
                            id="inviteCode"
                            value={inviteValue}
                            onChange={(event) => setInviteValue(event.target.value)}
                            placeholder={t("joinCodePlaceholder")}
                            className="h-11 rounded-[14px] border-border bg-surface ps-12 font-medium focus-visible:ring-primary/20"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={joinFromInvite}
                          className="h-11 shrink-0 rounded-[14px] bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-primary-hover"
                        >
                          {t("joinBtn")}
                          <ArrowRight className="ms-2 h-4 w-4 rtl:-scale-x-100" />
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setChoice(visibleChoice === "create" ? null : "create")}
                    className={cn(
                      "mt-2 w-full cursor-pointer rounded-[18px] border p-4 text-start transition-all duration-200",
                      visibleChoice === "create" ? "border-primary/55 bg-primary/5 ring-4 ring-primary/10" : "border-transparent bg-transparent hover:bg-muted",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                        visibleChoice === "create" ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-background text-text-secondary",
                      )}>
                        <Building2 className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-bold tracking-tight text-foreground">{t("createTitle")}</h2>
                        <p className="mt-1 max-w-md text-xs font-medium leading-6 text-text-secondary">{t("createDesc")}</p>
                      </div>
                    </div>
                  </button>

                  {visibleChoice === "create" ? (
                    <form
                      action={`/api/auth/workos/bootstrap-organization?locale=${locale}`}
                      method="post"
                      className="mx-1 space-y-4 rounded-[18px] border border-border bg-background/60 p-4"
                    >
                  <div className="space-y-3">
                    <Label htmlFor="orgName" className="text-xs font-bold text-text-secondary">
                      {t("createNameLabel")}
                    </Label>
                    <Input
                      id="orgName"
                      name="name"
                      required
                      placeholder={t("createNamePlaceholder")}
                      className="h-11 rounded-[14px] border-border bg-surface font-medium focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-text-secondary">
                      {t("createTypeLabel")}
                    </Label>
                    <input type="hidden" name="type" value={orgType} />
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOrgType("broker")}
                        className={cn(
                          "h-11 rounded-[14px] border text-xs font-bold transition-all",
                          orgType === "broker" ? "border-primary bg-surface text-primary ring-4 ring-primary/10" : "border-border text-text-secondary hover:bg-muted",
                        )}
                      >
                        {t("typeBroker")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrgType("developer")}
                        className={cn(
                          "h-11 rounded-[14px] border text-xs font-bold transition-all",
                          orgType === "developer" ? "border-primary bg-surface text-primary ring-4 ring-primary/10" : "border-border text-text-secondary hover:bg-muted",
                        )}
                      >
                        {t("typeDeveloper")}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="h-11 w-full rounded-[14px] bg-zinc-950 text-xs font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
                    <ArrowRight className="ms-3 h-4 w-4 rtl:-scale-x-100" />
                    {t("createBtn")}
                  </Button>
                </form>
              ) : null}
                </>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
