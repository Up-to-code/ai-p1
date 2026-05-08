import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface WizardStepperProps {
  currentStep: number; // 1-indexed (1, 2, 3, 4)
}

export function WizardStepper({ currentStep }: WizardStepperProps) {
  const t = useTranslations("Onboarding.stepper");
  
  const STEP_DATA = [
    { id: "01", name: t("company") },
    { id: "02", name: t("legal") },
    { id: "03", name: t("brand") },
    { id: "04", name: t("team") },
  ];
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {STEP_DATA.map((step, index) => {
          const stepNumber = index + 1;
          const status = stepNumber < currentStep ? "complete" : stepNumber === currentStep ? "current" : "upcoming";
          
          return (
            <li key={step.name} className={cn("relative", index !== STEP_DATA.length - 1 ? "pe-8 sm:pe-20" : "")}>
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div 
                  className={cn(
                    "h-[2px] w-full",
                    status === "complete" ? "bg-primary" : "bg-border/60"
                  )} 
                />
              </div>
              <div
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background transition-colors duration-300",
                  status === "complete" 
                    ? "border-primary bg-primary" 
                    : status === "current"
                    ? "border-primary"
                    : "border-border/60"
                )}
                aria-current={status === "current" ? "step" : undefined}
              >
                {status === "complete" ? (
                  <Check className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
                ) : (
                  <span 
                    className={cn(
                      "text-xs font-semibold", 
                      status === "current" ? "text-primary" : "text-text-muted"
                    )}
                  >
                    {step.id}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-6 start-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap text-text-primary hidden sm:block">
                 {status === "current" && step.name}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
