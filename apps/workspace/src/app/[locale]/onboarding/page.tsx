"use client";

import { useState } from "react";
import { useAuth, useOrganization, useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { WorkspaceRouteLoading } from "@/components/loading/workspace-route-loading";
import { BrandMark } from "@/components/logo";
import { Link } from "@/i18n/routing";
import { WizardStepper } from "@/domains/onboarding";
import { CompanyInfoForm } from "@/domains/onboarding";
import { BrandSetupForm } from "@/domains/onboarding";
import { TeamInviteForm } from "@/domains/onboarding";
import { useRouter } from "@/i18n/routing";

export default function OnboardingPage() {
  const t = useTranslations("Onboarding");
  const router = useRouter();
  const auth = useAuth();
  const organization = useOrganization();
  const user = useUser();
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const finishSetup = () => router.push("/dashboard");
  const organizationName = organization.organization?.name ?? "";

  if (!auth.isLoaded || !organization.isLoaded || !user.isLoaded) {
    return <WorkspaceRouteLoading variant="onboarding" />;
  }

  if (!auth.isSignedIn || !organization.organization) {
    return (
      <div className="flex min-h-[70svh] w-full max-w-lg flex-col items-center justify-center text-center">
        <Link href="/" className="mb-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card">
            <BrandMark className="h-5 w-5" priority />
          </span>
          <span className="text-lg font-black text-foreground">qentrah</span>
        </Link>
        <h1 className="text-3xl font-semibold tracking-0 text-zinc-950 dark:text-white">
          {t("organizationRequiredTitle")}
        </h1>
        <p className="mt-4 max-w-sm text-sm font-medium leading-6 text-zinc-500 dark:text-zinc-400">
          {t("organizationRequiredDesc")}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="inline-flex h-12 items-center justify-center rounded-2xl bg-foreground px-6 text-sm font-bold text-background hover:bg-foreground/90" href="/choose-org">
            {t("chooseOrganization")}
          </Link>
          <Link className="inline-flex h-12 items-center justify-center rounded-2xl border border-border px-6 text-sm font-bold text-foreground hover:bg-accent" href="/sign-in">
            {t("signIn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-12">
      <Link href="/" className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card">
          <BrandMark className="h-5 w-5" priority />
        </span>
        <span className="text-lg font-black text-foreground">qentrah</span>
      </Link>
      <div className="w-full flex flex-col items-center text-center gap-9">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-0 text-foreground md:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-md text-sm font-medium leading-6 text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <WizardStepper currentStep={currentStep} />
      </div>

      <div className="w-full">
        {currentStep === 1 && <CompanyInfoForm onNext={nextStep} organizationName={organizationName} />}
        {currentStep === 2 && <BrandSetupForm onNext={nextStep} onBack={prevStep} />}
        {currentStep === 3 && (
          <TeamInviteForm
            organizationId={organization.organization.id}
            currentUserEmail={user.user?.primaryEmailAddress?.emailAddress ?? null}
            onBack={prevStep}
            onFinish={finishSetup}
          />
        )}
      </div>
    </div>
  );
}
