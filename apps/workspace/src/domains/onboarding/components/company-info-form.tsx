"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { companyInfoSchema, type CompanyInfoInput } from "../validation/onboarding.schema";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface FormProps {
  onNext: () => void;
  organizationName: string;
}

export function CompanyInfoForm({ onNext, organizationName }: FormProps) {
  const t = useTranslations("Onboarding.company");
  const tc = useTranslations("Common");
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CompanyInfoInput>({
    resolver: zodResolver(companyInfoSchema as any),
    defaultValues: { legalName: organizationName, displayName: organizationName, crNumber: "", hqCity: "" },
  });

  useEffect(() => {
    if (!organizationName) return;
    setValue("legalName", organizationName, { shouldValidate: true });
    setValue("displayName", organizationName, { shouldValidate: true });
  }, [organizationName, setValue]);
  
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <Card className="w-full rounded-[24px] border border-border bg-[oklch(99%_0.004_255)] dark:border-white/10 dark:bg-[oklch(13%_0.016_255)]">
        <CardHeader className="pb-7 pt-8">
          <CardTitle className="text-2xl font-semibold tracking-0 text-foreground text-start">{t("title")}</CardTitle>
          <CardDescription className="mt-2 text-sm font-medium leading-6 text-muted-foreground text-start dark:text-muted-foreground">
            {t("desc")}
          </CardDescription>
        </CardHeader>
      
        <CardContent className="space-y-6 px-8">
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
            <input type="hidden" {...register("displayName")} />
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <Label htmlFor="legalName" className="text-sm font-semibold text-foreground dark:text-muted-foreground/40">{t("legalName")}</Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("legalNameTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input id="legalName" placeholder={t("legalNamePlaceholder")} className="h-12 rounded-2xl border-border bg-transparent px-4 text-sm font-medium focus-visible:ring-blue-600/15 dark:border-white/10" aria-invalid={Boolean(errors.legalName)} {...register("legalName")} />
              {errors.legalName && <p className="text-xs font-semibold text-red-600">{errors.legalName.message}</p>}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <Label htmlFor="crNumber" className="text-sm font-semibold text-foreground dark:text-muted-foreground/40">
                  {t("crNumber")} <span className="ms-1 font-medium normal-case tracking-normal text-muted-foreground">{tc("optional")}</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("crTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input id="crNumber" placeholder={t("crNumberPlaceholder")} className="h-12 rounded-2xl border-border bg-transparent px-4 text-sm font-medium focus-visible:ring-blue-600/15 dark:border-white/10" aria-invalid={Boolean(errors.crNumber)} {...register("crNumber")} />
              {errors.crNumber && <p className="text-xs font-semibold text-red-600">{errors.crNumber.message}</p>}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <Label htmlFor="hqCity" className="text-sm font-semibold text-foreground dark:text-muted-foreground/40">
                  {t("city")} <span className="ms-1 font-medium normal-case tracking-normal text-muted-foreground">{tc("optional")}</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("cityTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input id="hqCity" placeholder={t("cityPlaceholder")} className="h-12 rounded-2xl border-border bg-transparent px-4 text-sm font-medium focus-visible:ring-blue-600/15 dark:border-white/10" aria-invalid={Boolean(errors.hqCity)} {...register("hqCity")} />
              {errors.hqCity && <p className="text-xs font-semibold text-red-600">{errors.hqCity.message}</p>}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-8 pb-8 px-8 flex items-center justify-between rtl:flex-row-reverse border-t border-border dark:border-white/10 mt-8">
          <Button variant="ghost" type="button" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
            {tc("saveAndExit")}
          </Button>
          <Button className="h-12 px-7 rounded-2xl bg-foreground text-sm font-bold text-white hover:bg-foreground/90 dark:bg-white dark:text-foreground dark:hover:bg-muted" type="submit">
            {t("continue")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
