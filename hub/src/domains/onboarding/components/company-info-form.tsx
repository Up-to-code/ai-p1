"use client";

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
}

export function CompanyInfoForm({ onNext }: FormProps) {
  const t = useTranslations("Onboarding.company");
  const tc = useTranslations("Common");
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyInfoInput>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: { legalName: "", displayName: "", crNumber: "", hqCity: "" },
  });
  
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <Card className="w-full border-0 shadow-none bg-zinc-50 dark:bg-white/[0.02] rounded-[24px]">
        <CardHeader className="pb-8 pt-8">
          <CardTitle className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white text-start">{t("title")}</CardTitle>
          <CardDescription className="text-xs font-bold text-zinc-500 text-start mt-2">
            {t("desc")}
          </CardDescription>
        </CardHeader>
      
        <CardContent className="space-y-6 px-8">
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <Label htmlFor="legalName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("legalName")}</Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-900 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("legalNameTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input id="legalName" placeholder={t("legalNamePlaceholder")} className="h-12 rounded-xl border-zinc-200 bg-white font-medium focus-visible:ring-blue-600/20 dark:border-white/10 dark:bg-[#0A0A0A]" aria-invalid={Boolean(errors.legalName)} {...register("legalName")} />
              {errors.legalName && <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{errors.legalName.message}</p>}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <Label htmlFor="displayName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("displayName")}</Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-900 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("displayNameTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input id="displayName" placeholder={t("displayNamePlaceholder")} className="h-12 rounded-xl border-zinc-200 bg-white font-medium focus-visible:ring-blue-600/20 dark:border-white/10 dark:bg-[#0A0A0A]" aria-invalid={Boolean(errors.displayName)} {...register("displayName")} />
              {errors.displayName && <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{errors.displayName.message}</p>}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <Label htmlFor="crNumber" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {t("crNumber")} <span className="ms-1 font-medium normal-case tracking-normal text-zinc-400">{tc("optional")}</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-900 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("crTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input id="crNumber" placeholder={t("crNumberPlaceholder")} className="h-12 rounded-xl border-zinc-200 bg-white font-medium focus-visible:ring-blue-600/20 dark:border-white/10 dark:bg-[#0A0A0A]" aria-invalid={Boolean(errors.crNumber)} {...register("crNumber")} />
              {errors.crNumber && <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{errors.crNumber.message}</p>}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <Label htmlFor="hqCity" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {t("city")} <span className="ms-1 font-medium normal-case tracking-normal text-zinc-400">{tc("optional")}</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-900 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("cityTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input id="hqCity" placeholder={t("cityPlaceholder")} className="h-12 rounded-xl border-zinc-200 bg-white font-medium focus-visible:ring-blue-600/20 dark:border-white/10 dark:bg-[#0A0A0A]" aria-invalid={Boolean(errors.hqCity)} {...register("hqCity")} />
              {errors.hqCity && <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{errors.hqCity.message}</p>}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-8 pb-8 px-8 flex items-center justify-between rtl:flex-row-reverse border-t border-zinc-200 dark:border-white/10 mt-8">
          <Button variant="ghost" type="button" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
            {tc("saveAndExit")}
          </Button>
          <Button className="h-14 px-8 rounded-[28px] bg-zinc-900 text-white hover:bg-black font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-zinc-900/20 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all active:scale-[0.98]" type="submit">
            {t("continue")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
