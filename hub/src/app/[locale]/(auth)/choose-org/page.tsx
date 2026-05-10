"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Users, ArrowRight, Link2, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/ui/toast";

type Choice = "join" | "create" | null;
type AuthError = { message?: string; code?: string };
type AuthResult<T> = { data?: T | null; error?: AuthError | null };
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
  const router = useRouter();
  const { toast } = useToast();
  const [choice, setChoice] = useState<Choice>(null);
  const [orgType, setOrgType] = useState<"broker" | "developer" | null>(null);
  const [orgName, setOrgName] = useState("");
  const [inviteValue, setInviteValue] = useState("");
  const [busy, setBusy] = useState(false);
  const organizationsQuery = authClient.useListOrganizations();
  const organizations = (organizationsQuery.data ?? []) as BetterAuthOrganization[];

  async function setActiveOrganization(organizationId: string) {
    setBusy(true);
    try {
      const result = await organizationApi.organization.setActive({ organizationId });
      if (result.error) throw new Error(result.error.message ?? result.error.code ?? t("errorDesc"));
      router.push("/dashboard");
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
      const result = await organizationApi.organization.create({
        name,
        slug: slugifyOrganizationName(name),
        metadata: { type: orgType ?? "developer", status: "Workspace ready" },
      });
      if (result.error || !result.data?.id) throw new Error(result.error?.message ?? result.error?.code ?? t("errorDesc"));
      await organizationApi.organization.setActive({ organizationId: result.data.id });
      router.push("/settings/organization");
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
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-white p-6 dark:bg-[#0A0A0A]">
      {/* Decorative atmospheric background */}
      <div className="absolute top-0 left-1/2 h-[600px] w-full max-w-[1200px] -translate-x-1/2 bg-gradient-to-b from-blue-50/50 to-transparent blur-3xl dark:from-blue-900/10 pointer-events-none" />

      <div className="absolute top-10 left-10 rtl:left-auto rtl:right-10 z-10">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          {t("joinBtn") /* Placeholder for back */}
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-lg space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white md:text-4xl">
            {t("title")}
          </h1>
          <p className="text-sm font-medium leading-relaxed tracking-tight text-zinc-500">
            {t("subtitle")}
          </p>
        </div>

        {/* Option Cards */}
        <div className="grid gap-4">
          {organizations.length > 0 && (
            <Card className="rounded-[24px] border-zinc-200 bg-zinc-50 shadow-none dark:border-white/10 dark:bg-white/[0.02]">
              <CardContent className="space-y-3 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("existingTitle")}</p>
                {organizations.map((organization) => (
                  <button
                    key={organization.id}
                    type="button"
                    onClick={() => setActiveOrganization(organization.id)}
                    disabled={busy}
                    className="flex h-12 w-full items-center justify-between rounded-xl bg-white px-4 text-start text-sm font-black text-zinc-900 ring-1 ring-zinc-200 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:bg-[#0A0A0A] dark:text-white dark:ring-white/10"
                  >
                    <span className="truncate">{organization.name}</span>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400" /> : <ArrowRight className="h-4 w-4 text-zinc-400 rtl:-scale-x-100" />}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Join Organization */}
          <button
            onClick={() => setChoice(choice === "join" ? null : "join")}
            className={cn(
              "w-full text-start p-6 rounded-[24px] border-2 transition-all duration-300 bg-white dark:bg-[#0A0A0A] cursor-pointer",
              choice === "join"
                ? "border-blue-600"
                : "border-zinc-200 hover:border-zinc-300 dark:border-white/10 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
            )}
          >
            <div className="flex items-center gap-5">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300",
                choice === "join" ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400"
              )}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight text-zinc-900 dark:text-white">{t("joinTitle")}</h3>
                <p className="text-xs font-medium text-zinc-500 mt-1">{t("joinDesc")}</p>
              </div>
            </div>
          </button>

          {/* Join Expansion */}
          <div className={cn("grid transition-all duration-300 ease-in-out", choice === "join" ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0")}>
            <div className="overflow-hidden">
              <Card className="border-0 bg-zinc-50 dark:bg-white/[0.02] rounded-[24px]">
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
                          className="h-12 ps-12 rounded-xl border-zinc-200 bg-white font-medium focus-visible:ring-blue-600/20 dark:border-white/10 dark:bg-[#0A0A0A]"
                        />
                      </div>
                      <Button type="button" onClick={joinFromInvite} disabled={busy} className="h-12 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-black uppercase tracking-widest text-[10px] shrink-0">
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
          </div>

          {/* Create Organization */}
          <button
            onClick={() => setChoice(choice === "create" ? null : "create")}
            className={cn(
              "w-full text-start p-6 rounded-[24px] border-2 transition-all duration-300 bg-white dark:bg-[#0A0A0A] cursor-pointer",
              choice === "create"
                ? "border-blue-600"
                : "border-zinc-200 hover:border-zinc-300 dark:border-white/10 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
            )}
          >
            <div className="flex items-center gap-5">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300",
                choice === "create" ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400"
              )}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight text-zinc-900 dark:text-white">{t("createTitle")}</h3>
                <p className="text-xs font-medium text-zinc-500 mt-1">{t("createDesc")}</p>
              </div>
            </div>
          </button>

          {/* Create Expansion */}
          <div className={cn("grid transition-all duration-300 ease-in-out", choice === "create" ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0")}>
            <div className="overflow-hidden">
              <Card className="border-0 bg-zinc-50 dark:bg-white/[0.02] rounded-[24px]">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="orgName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("createNameLabel")}</Label>
                    <Input
                      id="orgName"
                      value={orgName}
                      onChange={(event) => setOrgName(event.target.value)}
                      placeholder={t("createNamePlaceholder")}
                      className="h-12 rounded-xl border-zinc-200 bg-white font-medium focus-visible:ring-blue-600/20 dark:border-white/10 dark:bg-[#0A0A0A]"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("createTypeLabel")}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOrgType("broker")}
                        className={cn(
                          "h-12 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] transition-all",
                          orgType === "broker" 
                            ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400" 
                            : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.02]"
                        )}
                      >
                        {t("typeBroker")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrgType("developer")}
                        className={cn(
                          "h-12 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] transition-all",
                          orgType === "developer" 
                            ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400" 
                            : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.02]"
                        )}
                      >
                        {t("typeDeveloper")}
                      </button>
                    </div>
                  </div>
                  <Button type="button" onClick={createOrganization} disabled={busy} className="w-full h-14 rounded-[28px] bg-zinc-900 text-white hover:bg-black font-black uppercase tracking-widest text-[11px] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all active:scale-[0.98]">
                    {busy ? <Loader2 className="me-3 h-4 w-4 animate-spin" /> : <ArrowRight className="ms-3 w-4 h-4 rtl:-scale-x-100" />}
                    {t("createBtn")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
