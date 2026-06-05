"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploadZone } from "@/components/custom/file-upload-zone";
import { legalDocsSchema, type LegalDocsInput } from "../validation/onboarding.schema";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface FormProps {
  onNext: () => void;
  onBack: () => void;
}

export function LegalDocsForm({ onNext, onBack }: FormProps) {
  const t = useTranslations("Onboarding.legal");
  const tc = useTranslations("Common");
  const { register, handleSubmit, formState: { errors } } = useForm<LegalDocsInput>({
    resolver: zodResolver(legalDocsSchema),
    defaultValues: { authName: "", authTitle: "" },
  });
  
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <Card className="w-full rounded-[24px] border border-zinc-200 bg-[oklch(99%_0.004_255)] dark:border-white/10 dark:bg-[oklch(13%_0.016_255)]">
        <CardHeader className="pb-8 pt-8">
          <CardTitle className="text-2xl font-semibold tracking-0 text-zinc-950 dark:text-white text-start">{t("title")}</CardTitle>
          <CardDescription className="mt-2 text-sm font-medium leading-6 text-zinc-500 text-start dark:text-zinc-400">
            {t("desc")}
          </CardDescription>
        </CardHeader>
      
        <CardContent className="space-y-8 px-8">
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <Label htmlFor="authName" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {t("signerName")} <span className="ms-1 font-medium normal-case tracking-normal text-zinc-400">{tc("optional")}</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-900 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("nameTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input id="authName" placeholder={t("signerNamePlaceholder")} className="h-12 rounded-2xl border-zinc-200 bg-transparent px-4 text-sm font-medium focus-visible:ring-blue-600/15 dark:border-white/10" aria-invalid={Boolean(errors.authName)} {...register("authName")} />
              {errors.authName && <p className="text-xs font-semibold text-red-600">{errors.authName.message}</p>}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <Label htmlFor="authTitle" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {t("signerTitle")} <span className="ms-1 font-medium normal-case tracking-normal text-zinc-400">{tc("optional")}</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-900 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("titleTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input id="authTitle" placeholder={t("signerTitlePlaceholder")} className="h-12 rounded-2xl border-zinc-200 bg-transparent px-4 text-sm font-medium focus-visible:ring-blue-600/15 dark:border-white/10" aria-invalid={Boolean(errors.authTitle)} {...register("authTitle")} />
              {errors.authTitle && <p className="text-xs font-semibold text-red-600">{errors.authTitle.message}</p>}
            </div>
          </div>

          <div className="space-y-6">
            <FileUploadZone 
              label={
                <div className="flex items-center gap-1">
                  {t("crDoc")} <span className="ms-1 font-medium normal-case tracking-normal text-zinc-400">{tc("optional")}</span>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex cursor-help">
                      <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-900 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{t("crDocTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              } 
              description={t("crDesc")} 
            />
            <FileUploadZone 
              label={
                <div className="flex items-center gap-1">
                  {t("authLetter")} <span className="ms-1 font-medium normal-case tracking-normal text-zinc-400">{tc("optional")}</span>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex cursor-help">
                      <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-900 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{t("authLetterTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              } 
              description={t("authDesc")} 
            />
          </div>
        </CardContent>

        <CardFooter className="pt-8 pb-8 px-8 flex items-center justify-between rtl:flex-row-reverse border-t border-zinc-200 dark:border-white/10 mt-8">
          <Button variant="ghost" type="button" className="text-sm font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white" onClick={onBack}>
            {tc("back")}
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" type="button" className="text-sm font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white" onClick={onNext}>
              {tc("skipStep")}
            </Button>
            <Button className="h-12 px-7 rounded-2xl bg-zinc-950 text-sm font-bold text-white hover:bg-black dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100" type="submit">
              {t("continue")}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
