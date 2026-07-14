"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  Bot,
  BriefcaseBusiness,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  KanbanSquare,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { WorkspaceRouteLoading } from "@/components/loading/workspace-route-loading";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/routing";
import {
  createOrganizationInvitation,
  updateAuthOrganization,
} from "@/domains/organization/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const ORG_LOAD_TIMEOUT_MS = 15_000;

type StepId = "purpose" | "manage" | "invite" | "features" | "name";

const steps: StepId[] = ["purpose", "manage", "invite", "features", "name"];
const purposeOptions = ["work", "personal", "school"] as const;
const manageOptions = [
  "it",
  "marketing",
  "hr",
  "software",
  "pmo",
  "services",
  "startup",
  "finance",
  "sales",
  "support",
  "operations",
  "creative",
  "other",
] as const;
const featureOptions = [
  { id: "tasks", icon: Check },
  { id: "crm", icon: BriefcaseBusiness },
  { id: "calendar", icon: Calendar },
  { id: "time", icon: Clock3 },
  { id: "ai", icon: Bot },
  { id: "dashboards", icon: LayoutDashboard },
  { id: "goals", icon: Target },
  { id: "boards", icon: KanbanSquare },
  { id: "chat", icon: MessageSquare },
] as const;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function authErrorMessage(error: unknown, fallback: string) {
  if (!error) return fallback;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return fallback;
}

export default function OnboardingPage() {
  const t = useTranslations("Onboarding.quick");
  const fallback = useTranslations("Onboarding");
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: activeOrg, isPending: activeOrgPending } =
    authClient.useActiveOrganization();
  const [stepIndex, setStepIndex] = useState(0);
  const [purpose, setPurpose] = useState<(typeof purposeOptions)[number] | "">(
    "",
  );
  const [manage, setManage] = useState<(typeof manageOptions)[number] | "">(
    "it",
  );
  const [inviteInput, setInviteInput] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>(["tasks"]);
  const [workspaceNameOverride, setWorkspaceNameOverride] = useState<string>();
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState("");
  const [orgLoadTimedOut, setOrgLoadTimedOut] = useState(false);
  const hasRedirected = useRef(false);

  const isLoaded = !sessionPending && !activeOrgPending;
  const currentStep = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const workspaceName = workspaceNameOverride ?? activeOrg?.name ?? "";

  useEffect(() => {
    if (isLoaded || orgLoadTimedOut) return;
    const timer = setTimeout(
      () => setOrgLoadTimedOut(true),
      ORG_LOAD_TIMEOUT_MS,
    );
    return () => clearTimeout(timer);
  }, [isLoaded, orgLoadTimedOut]);

  useEffect(() => {
    if (orgLoadTimedOut && !isLoaded && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/choose-org");
    }
  }, [orgLoadTimedOut, isLoaded, router]);

  const canGoNext = useMemo(() => {
    if (currentStep === "purpose") return Boolean(purpose);
    if (currentStep === "name") return workspaceName.trim().length > 1;
    return true;
  }, [currentStep, purpose, workspaceName]);

  function addInvite() {
    const email = inviteInput.trim().toLowerCase();
    if (!email) return;
    if (!isEmail(email)) {
      setError(t("invalidEmail"));
      return;
    }
    setInvites((current) =>
      current.includes(email) ? current : [...current, email],
    );
    setInviteInput("");
    setError("");
  }

  function next() {
    if (!canGoNext) return;
    setError("");
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  async function finish() {
    if (!activeOrg?.id || !workspaceName.trim()) return;
    setIsFinishing(true);
    setError("");
    try {
      await updateAuthOrganization(activeOrg.id, {
        name: workspaceName.trim(),
        metadata: { onboarding: { purpose, manage, features } },
      });
      await Promise.allSettled(
        invites.map((email) =>
          createOrganizationInvitation(activeOrg.id, { email, role: "member" }),
        ),
      );
      router.push("/ws");
    } catch (caught) {
      setError(authErrorMessage(caught, t("finishError")));
    } finally {
      setIsFinishing(false);
    }
  }

  if (!isLoaded) return <WorkspaceRouteLoading variant="onboarding" />;

  if (!session?.user || !activeOrg) {
    return (
      <div className="flex min-h-[70svh] w-full max-w-lg flex-col items-center justify-center text-center">
        <Link href="/" className="mb-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card">
            <BrandMark className="h-5 w-5" priority />
          </span>
          <span className="text-lg font-black text-foreground">qentrah</span>
        </Link>
        <h1 className="text-3xl font-semibold tracking-0 text-foreground dark:text-white">
          {fallback("organizationRequiredTitle")}
        </h1>
        <p className="mt-4 max-w-sm text-sm font-medium leading-6 text-muted-foreground">
          {fallback("organizationRequiredDesc")}
        </p>
        <Link
          className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-foreground px-6 text-sm font-bold text-background hover:bg-foreground/90"
          href="/choose-org"
        >
          {fallback("chooseOrganization")}
        </Link>
      </div>
    );
  }

  return (
    <main className="relative min-h-svh w-full overflow-hidden bg-[#050607] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top_left,rgba(255,91,52,0.2),transparent_45%),radial-gradient(ellipse_at_top_right,rgba(58,130,255,0.16),transparent_42%),linear-gradient(100deg,rgba(183,52,180,0.12),transparent_70%)]" />
      <section className="relative mx-auto flex min-h-svh w-full max-w-7xl flex-col px-6 py-6 sm:px-10 sm:py-8 lg:px-16">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex w-fit items-center gap-2">
            <BrandMark className="h-5 w-5" priority />
            <span className="text-base font-black tracking-tight">qentrah</span>
          </Link>
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => router.push("/ws")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex flex-1 items-center py-12 sm:py-16">
          <div className="w-full">
            {currentStep === "purpose" ? (
              <StepBlock title={t("purposeTitle")}>
                <PillGrid>
                  {purposeOptions.map((option) => (
                    <ChoicePill
                      key={option}
                      selected={purpose === option}
                      onClick={() => setPurpose(option)}
                    >
                      {t(`purpose.${option}`)}
                    </ChoicePill>
                  ))}
                </PillGrid>
              </StepBlock>
            ) : null}

            {currentStep === "manage" ? (
              <StepBlock title={t("manageTitle")}>
                <PillGrid>
                  {manageOptions.map((option) => (
                    <ChoicePill
                      key={option}
                      selected={manage === option}
                      onClick={() => setManage(option)}
                    >
                      {t(`manage.${option}`)}
                    </ChoicePill>
                  ))}
                </PillGrid>
              </StepBlock>
            ) : null}

            {currentStep === "invite" ? (
              <StepBlock title={t("inviteTitle")}>
                <Input
                  value={inviteInput}
                  onChange={(event) => {
                    setInviteInput(event.target.value);
                    setError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addInvite();
                    }
                  }}
                  placeholder={t("invitePlaceholder")}
                  className="h-12 rounded-lg border-white/20 bg-transparent text-sm text-white placeholder:text-white/35 focus-visible:ring-white/20"
                />
                <div className="mt-5 flex w-fit items-center gap-2 rounded bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                  {t("inviteHint")}
                </div>
                <p className="mt-2 text-xs font-semibold text-white/30">
                  {t("inviteEnter")}
                </p>
                {invites.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {invites.map((email) => (
                      <button
                        type="button"
                        key={email}
                        onClick={() =>
                          setInvites((current) =>
                            current.filter((item) => item !== email),
                          )
                        }
                        className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
                      >
                        {email} x
                      </button>
                    ))}
                  </div>
                ) : null}
              </StepBlock>
            ) : null}

            {currentStep === "features" ? (
              <StepBlock title={t("featuresTitle")}>
                <div className="grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {featureOptions.map((feature) => {
                    const Icon = feature.icon;
                    const selected = features.includes(feature.id);
                    return (
                      <button
                        type="button"
                        key={feature.id}
                        onClick={() =>
                          setFeatures((current) =>
                            current.includes(feature.id)
                              ? current.filter((item) => item !== feature.id)
                              : [...current, feature.id],
                          )
                        }
                        className={cn(
                          "flex h-10 items-center justify-between rounded-full border px-4 text-sm font-semibold transition",
                          selected
                            ? "border-white bg-white text-black"
                            : "border-white/15 bg-transparent text-white/70 hover:border-white/35 hover:text-white",
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {t(`features.${feature.id}`)}
                          </span>
                        </span>
                        {selected ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4 opacity-40" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </StepBlock>
            ) : null}

            {currentStep === "name" ? (
              <StepBlock title={t("nameTitle")}>
                <Input
                  value={workspaceName}
                  onChange={(event) => setWorkspaceNameOverride(event.target.value)}
                  className="h-12 max-w-3xl rounded-lg border-white/20 bg-transparent text-sm text-white placeholder:text-white/35 focus-visible:ring-white/20"
                />
                <p className="mt-4 text-xs font-semibold text-white/30">
                  {t("nameHint")}
                </p>
              </StepBlock>
            ) : null}
          </div>
        </div>

        <footer className="w-full space-y-5 pb-2">
          <div className="h-1 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {error ? (
            <p className="text-sm font-semibold text-red-300">{error}</p>
          ) : null}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setStepIndex((current) => Math.max(current - 1, 0))
              }
              disabled={stepIndex === 0 || isFinishing}
              className="h-10 rounded-lg border-white/15 bg-transparent px-4 text-white hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("back")}
            </Button>
            {currentStep === "name" ? (
              <Button
                type="button"
                onClick={() => void finish()}
                disabled={!canGoNext || isFinishing}
                className="h-10 rounded-lg bg-white px-5 text-sm font-bold text-black hover:bg-white/90"
              >
                {isFinishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("finish")
                )}
                {!isFinishing ? <Check className="h-4 w-4" /> : null}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={next}
                disabled={!canGoNext}
                className="h-10 rounded-lg bg-white px-5 text-sm font-bold text-black hover:bg-white/90 disabled:opacity-40"
              >
                {t("next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </footer>
      </section>
    </main>
  );
}

function StepBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold tracking-0 text-white sm:text-3xl">
        {title}
      </h1>
      {children}
    </div>
  );
}

function PillGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-3">{children}</div>;
}

function ChoicePill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 rounded-full border px-6 text-sm font-semibold transition",
        selected
          ? "border-white bg-white text-black"
          : "border-white/20 bg-transparent text-white/70 hover:border-white/40 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
