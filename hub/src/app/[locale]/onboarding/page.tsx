"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { WizardStepper } from "@/domains/onboarding";
import { CompanyInfoForm } from "@/domains/onboarding";
import { LegalDocsForm } from "@/domains/onboarding";
import { BrandSetupForm } from "@/domains/onboarding";
import { TeamInviteForm } from "@/domains/onboarding";

export default function OnboardingPage() {
  const t = useTranslations("Onboarding");
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-12">
      
      {/* Stepper Header */}
      <div className="w-full flex flex-col items-center text-center gap-8">
        <div>
          <h1 className="text-h2 font-semibold text-text-primary tracking-tight mb-2">{t("title")}</h1>
          <p className="text-text-secondary">{t("subtitle")}</p>
        </div>
        <WizardStepper currentStep={currentStep} />
      </div>

      {/* Dynamic Form Content */}
      <div className="w-full">
        {currentStep === 1 && <CompanyInfoForm onNext={nextStep} />}
        {currentStep === 2 && <LegalDocsForm onNext={nextStep} onBack={prevStep} />}
        {currentStep === 3 && <BrandSetupForm onNext={nextStep} onBack={prevStep} />}
        {currentStep === 4 && <TeamInviteForm onBack={prevStep} />}
      </div>
      
    </div>
  );
}
