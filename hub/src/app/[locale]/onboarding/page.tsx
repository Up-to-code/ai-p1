"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { WizardStepper } from "@/domains/onboarding";
import { CompanyInfoForm } from "@/domains/onboarding";
import { BrandSetupForm } from "@/domains/onboarding";
import { TeamInviteForm } from "@/domains/onboarding";
import { useRouter } from "@/i18n/routing";

export default function OnboardingPage() {
  const t = useTranslations("Onboarding");
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const finishSetup = () => router.push("/dashboard");

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-16">
      
      {/* Stepper Header */}
      <div className="w-full flex flex-col items-center text-center gap-10">
        <div className="space-y-4">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white md:text-4xl">
            {t("title")}
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
            {t("subtitle")}
          </p>
        </div>
        <WizardStepper currentStep={currentStep} />
      </div>

      {/* Dynamic Form Content */}
      <div className="w-full">
        {currentStep === 1 && <CompanyInfoForm onNext={nextStep} />}
        {currentStep === 2 && <BrandSetupForm onNext={nextStep} onBack={prevStep} />}
        {currentStep === 3 && <TeamInviteForm onBack={prevStep} onFinish={finishSetup} />}
      </div>
      
    </div>
  );
}
