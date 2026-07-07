"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  Eye,
  Loader2,
  LogOut,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type ChooseOrganizationClientProps = {
  locale: string;
};

const createSteps = ["name", "profile", "preview"] as const;
type CreateStep = (typeof createSteps)[number];

function authErrorMessage(error: unknown, fallback: string) {
  if (!error) return fallback;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function WorkspaceListSkeleton({ label }: { label: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div className="min-h-28 rounded-xl border border-border/70 bg-card/70 p-4" key={item}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
              <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        </div>
      ))}
      <p className="text-xs font-semibold text-muted-foreground sm:col-span-2">{label}</p>
    </div>
  );
}

export function ChooseOrganizationClient({ locale }: ChooseOrganizationClientProps) {
  const t = useTranslations("ChooseOrg");
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: orgs, isPending: orgsPending } = authClient.useListOrganizations();
  const [mode, setMode] = useState<"list" | "create">("list");
  const [stepIndex, setStepIndex] = useState(0);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationPurpose, setOrganizationPurpose] = useState("");
  const [busyId, setBusyId] = useState("");
  const [busyAction, setBusyAction] = useState<"create" | "sign-out" | "">("");
  const [error, setError] = useState("");

  const isLoading = sessionPending || orgsPending;
  const currentStep = createSteps[stepIndex];
  const hasOrganizations = Boolean(orgs?.length);
  const organizationSlug = useMemo(() => slugify(organizationName), [organizationName]);

  useEffect(() => {
    if (!isLoading && !session?.user) {
      router.replace(`/sign-in?callbackURL=${encodeURIComponent(`/${locale}/choose-org`)}`);
    }
  }, [isLoading, session, locale, router]);

  useEffect(() => {
    if (!isLoading && orgs?.length === 0) setMode("create");
  }, [isLoading, orgs?.length]);

  const canGoNext = currentStep !== "name" || organizationName.trim().length > 1;

  async function selectOrganization(organizationId: string) {
    setBusyId(organizationId);
    setError("");
    try {
      const result = await authClient.organization.setActive({ organizationId });
      if (result.error) {
        throw new Error(authErrorMessage(result.error, t("errorDesc")));
      }
      router.replace("/ws");
    } catch (caught) {
      setError(authErrorMessage(caught, t("errorDesc")));
    } finally {
      setBusyId("");
    }
  }

  async function createOrganization() {
    const name = organizationName.trim();
    if (!name) {
      setError(t("nameRequired"));
      setStepIndex(0);
      return;
    }

    setBusyAction("create");
    setError("");
    try {
      const result = await authClient.organization.create({ name, slug: organizationSlug || `workspace-${Date.now()}` });
      if (result.error) {
        throw new Error(authErrorMessage(result.error, t("errorDesc")));
      }
      if (result.data?.id) {
        const activeResult = await authClient.organization.setActive({ organizationId: result.data.id });
        if (activeResult.error) {
          throw new Error(authErrorMessage(activeResult.error, t("errorDesc")));
        }
        router.replace("/onboarding");
        return;
      }
      throw new Error(t("errorDesc"));
    } catch (caught) {
      setError(authErrorMessage(caught, t("errorDesc")));
    } finally {
      setBusyAction("");
    }
  }

  async function handleUseAnotherAccount() {
    setBusyAction("sign-out");
    setError("");
    try {
      await authClient.signOut();
      router.replace("/sign-in");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errorDesc"));
    } finally {
      setBusyAction("");
    }
  }

  function goNext() {
    if (!canGoNext) {
      setError(t("nameRequired"));
      return;
    }
    setError("");
    setStepIndex((current) => Math.min(current + 1, createSteps.length - 1));
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div
          className="absolute -left-32 top-[-22rem] h-[42rem] w-[42rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, color-mix(in srgb, #F2488B 20%, transparent), transparent 66%)" }}
        />
        <div
          className="absolute right-[-18rem] top-[-18rem] h-[46rem] w-[46rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, color-mix(in srgb, #0C7DF3 20%, transparent), transparent 68%)" }}
        />
        <div
          className="absolute bottom-[-24rem] left-1/3 h-[48rem] w-[48rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, color-mix(in srgb, #834DF1 14%, transparent), transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 flex min-h-svh flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark className="h-6 w-6" priority />
            <span className="text-base font-black tracking-tight">qentrah</span>
          </Link>
          <Button
            className="rounded-lg text-muted-foreground hover:text-foreground"
            disabled={busyAction === "sign-out"}
            onClick={() => void handleUseAnotherAccount()}
            size="sm"
            type="button"
            variant="ghost"
          >
            {busyAction === "sign-out" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            <span className="hidden sm:inline">{busyAction === "sign-out" ? t("signingOut") : t("useAnotherAccount")}</span>
          </Button>
        </header>

        <section className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <aside className="max-w-xl">
            <div className="mb-6 text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
              {t("eyebrow")}
            </div>
            <h1 className="text-4xl font-black leading-[0.98] tracking-0 text-foreground sm:text-6xl lg:text-7xl rtl:leading-[1.08]">
              {hasOrganizations ? t("title") : t("createTitle")}
            </h1>
            <p className="mt-6 max-w-lg text-base font-medium leading-7 text-muted-foreground sm:text-lg">
              {hasOrganizations ? t("subtitle") : t("createDesc")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {session?.session?.activeOrganizationId ? (
                <Button className="rounded-lg" onClick={() => router.replace("/ws")} type="button" variant="outline">
                  {t("continueWorkspace")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              ) : null}
            </div>
          </aside>

          <section className="flex min-h-[560px] items-center justify-center">
            <div className="w-full max-w-2xl">
            {error ? (
              <div className="mb-5 flex items-start gap-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-semibold leading-6 text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}

            {isLoading ? (
              <WorkspaceListSkeleton label={t("loading")} />
            ) : mode === "list" && hasOrganizations ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {orgs?.map((org) => {
                    const isCurrent = session?.session?.activeOrganizationId === org.id;
                    return (
                      <button
                        className="group min-h-32 rounded-xl border border-border bg-card p-4 text-start transition hover:border-primary/50 hover:bg-accent/40 disabled:pointer-events-none disabled:opacity-60"
                        disabled={Boolean(busyId || busyAction)}
                        key={org.id}
                        onClick={() => void selectOrganization(org.id)}
                        type="button"
                      >
                        <span className="flex items-start gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                            {busyId === org.id ? (
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : isCurrent ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-black">{org.name ?? t("untitledWorkspace")}</span>
                            <span className="mt-1 block truncate text-xs font-semibold text-muted-foreground">
                              {isCurrent ? t("currentWorkspace") : org.slug ?? org.id}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100 rtl:rotate-180" />
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  className="flex w-full items-center justify-between rounded-xl px-2 py-3 text-start text-sm font-black text-muted-foreground transition hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
                  disabled={Boolean(busyId || busyAction)}
                  onClick={() => setMode("create")}
                  type="button"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Plus className="h-4 w-4" />
                    </span>
                    {t("createTitle")}
                  </span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            ) : (
              <div className="flex min-h-[500px] flex-col">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">{t("setupAccess")}</p>
                  {hasOrganizations ? (
                    <Button className="rounded-lg" onClick={() => setMode("list")} type="button" variant="ghost">
                      <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                      {t("existingTitle")}
                    </Button>
                  ) : null}
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  {createSteps.map((step, index) => {
                    const active = index === stepIndex;
                    const complete = index < stepIndex;
                    return (
                      <button
                        className="group flex items-center gap-3 text-start"
                        disabled={busyAction === "create" || (index > 0 && !organizationName.trim())}
                        key={step}
                        onClick={() => setStepIndex(index)}
                        type="button"
                      >
                        <span className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-black transition",
                          active && "border-primary bg-primary text-primary-foreground",
                          complete && "border-primary/40 bg-primary/10 text-primary",
                          !active && !complete && "border-border bg-card text-muted-foreground",
                        )}>
                          {complete ? <Check className="h-4 w-4" /> : index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-black">{t(`steps.${step}`)}</span>
                          <span className="mt-2 block h-0.5 rounded-full bg-border">
                            <span className={cn("block h-full rounded-full bg-primary transition-all", (active || complete) ? "w-full" : "w-0")} />
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-1 items-center py-10">
                  {currentStep === "name" ? (
                    <div className="w-full max-w-xl space-y-3">
                      <label htmlFor="organization-name" className="text-sm font-black">{t("createNameLabel")}</label>
                      <Input
                        className="h-12 rounded-lg"
                        id="organization-name"
                        onChange={(event) => {
                          setOrganizationName(event.target.value);
                          setError("");
                        }}
                        placeholder={t("createNamePlaceholder")}
                        value={organizationName}
                      />
                      <p className="text-xs font-semibold text-muted-foreground">{organizationSlug || "workspace-slug"}</p>
                    </div>
                  ) : null}

                  {currentStep === "profile" ? (
                    <div className="w-full max-w-xl space-y-3">
                      <label htmlFor="organization-purpose" className="text-sm font-black">{t("profileLabel")}</label>
                      <Input
                        className="h-12 rounded-lg"
                        id="organization-purpose"
                        onChange={(event) => setOrganizationPurpose(event.target.value)}
                        placeholder={t("profilePlaceholder")}
                        value={organizationPurpose}
                      />
                      <p className="text-xs font-semibold text-muted-foreground">{t("profileHint")}</p>
                    </div>
                  ) : null}

                  {currentStep === "preview" ? (
                    <div className="w-full max-w-xl">
                      <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">{t("previewTitle")}</p>
                          <h3 className="mt-2 truncate text-2xl font-black">{organizationName || t("untitledWorkspace")}</h3>
                          <p className="mt-1 truncate text-sm font-semibold text-muted-foreground">{organizationSlug || "workspace-slug"}</p>
                          {organizationPurpose ? <p className="mt-5 text-sm font-medium leading-6 text-muted-foreground">{organizationPurpose}</p> : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between pt-5">
                  <Button
                    className="rounded-lg"
                    disabled={stepIndex === 0 || busyAction === "create"}
                    onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
                    type="button"
                    variant="outline"
                  >
                    <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                    {t("back")}
                  </Button>
                  <div className="flex items-center gap-2">
                    {stepIndex < createSteps.length - 1 ? (
                      <>
                        <Button className="rounded-lg" disabled={!organizationName.trim()} onClick={() => setStepIndex(2)} type="button" variant="ghost">
                          <Eye className="h-4 w-4" />
                          {t("preview")}
                        </Button>
                        <Button className="rounded-lg" disabled={!canGoNext} onClick={goNext} type="button">
                          {t("next")}
                          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                        </Button>
                      </>
                    ) : (
                      <Button className="rounded-lg" disabled={busyAction === "create"} onClick={() => void createOrganization()} type="button">
                        {busyAction === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {busyAction === "create" ? t("creating") : t("createBtn")}
                        {busyAction === "create" ? null : <ArrowRight className="h-4 w-4 rtl:rotate-180" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
