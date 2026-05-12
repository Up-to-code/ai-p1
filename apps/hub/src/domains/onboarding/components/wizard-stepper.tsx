import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface WizardStepperProps {
  currentStep: number; // 1-indexed (1, 2, 3)
}

export function WizardStepper({ currentStep }: WizardStepperProps) {
  const t = useTranslations("Onboarding.stepper");
  
  const STEP_DATA = [
    { id: "01", name: t("company") },
    { id: "02", name: t("brand") },
    { id: "03", name: t("team") },
  ];
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-center">
        {STEP_DATA.map((step, index) => {
          const stepNumber = index + 1;
          const status = stepNumber < currentStep ? "complete" : stepNumber === currentStep ? "current" : "upcoming";
          
          return (
            <li key={step.name} className={cn("relative flex items-center", index !== STEP_DATA.length - 1 ? "pe-10 sm:pe-24" : "")}>
              {index !== STEP_DATA.length - 1 && (
                <div className="absolute top-1/2 left-8 right-2 rtl:left-2 rtl:right-8 -translate-y-1/2 h-[2px] transition-colors duration-300">
                  <div 
                    className={cn(
                      "h-full w-full rounded-full",
                      status === "complete" ? "bg-zinc-900 dark:bg-white" : "bg-zinc-100 dark:bg-white/10"
                    )} 
                  />
                </div>
              )}
              <div className="flex flex-col items-center gap-3 relative z-10 bg-white dark:bg-[#0A0A0A] py-1 px-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                    status === "complete" 
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" 
                      : status === "current"
                      ? "border-zinc-900 bg-white dark:border-white dark:bg-[#0A0A0A]"
                      : "border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0A0A0A]"
                  )}
                  aria-current={status === "current" ? "step" : undefined}
                >
                  {status === "complete" ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span 
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest", 
                        status === "current" ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600"
                      )}
                    >
                      {step.id}
                    </span>
                  )}
                </div>
                <span className="absolute -bottom-6 text-[9px] font-black uppercase tracking-widest whitespace-nowrap text-zinc-500 dark:text-zinc-400 hidden sm:block">
                  {status === "current" && step.name}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
