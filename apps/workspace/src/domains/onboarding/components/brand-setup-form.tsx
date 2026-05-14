"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploadZone } from "@/components/custom/file-upload-zone";
import { brandSetupSchema, type BrandSetupInput } from "../validation/onboarding.schema";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { brandIdentity } from "@qentrah/brand-identity";

interface FormProps {
  onNext: () => void;
  onBack: () => void;
}

export function BrandSetupForm({ onNext, onBack }: FormProps) {
  const t = useTranslations("Onboarding.brand");
  const tc = useTranslations("Common");
  const defaultBrandColor = brandIdentity.colors.primary;
  const { register, handleSubmit, formState: { errors } } = useForm<BrandSetupInput>({
    resolver: zodResolver(brandSetupSchema),
    defaultValues: { brandColor: defaultBrandColor },
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
      
        <CardContent className="space-y-8 px-8">
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              <Label htmlFor="brandColor" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("color")}</Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-900 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("brandColorTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-white/10 shadow-none shrink-0" style={{ backgroundColor: defaultBrandColor }} />
                <Input id="brandColor" placeholder={defaultBrandColor} className="h-12 rounded-xl border-zinc-200 bg-white font-medium focus-visible:ring-blue-600/20 dark:border-white/10 dark:bg-[#0A0A0A] font-mono" aria-invalid={Boolean(errors.brandColor)} {...register("brandColor")} />
              </div>
              {errors.brandColor && <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{errors.brandColor.message}</p>}
            </div>


          <div className="space-y-3">
            <FileUploadZone 
              label={
                <div className="flex items-center gap-1">
                  {t("logo")} <span className="ms-1 font-medium normal-case tracking-normal text-zinc-400">{tc("optional")}</span>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex cursor-help">
                      <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-900 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{t("logoTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              } 
              description={t("logoDesc")} 
            />
          </div>
        </CardContent>

        <CardFooter className="pt-8 pb-8 px-8 flex items-center justify-between rtl:flex-row-reverse border-t border-zinc-200 dark:border-white/10 mt-8">
          <Button variant="ghost" type="button" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white" onClick={onBack}>
            {tc("back")}
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" type="button" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white" onClick={onNext}>
              {tc("skipStep")}
            </Button>
            <Button className="h-14 px-8 rounded-[28px] bg-zinc-900 text-white hover:bg-black font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-zinc-900/20 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all active:scale-[0.98]" type="submit">
              {t("continue")}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
