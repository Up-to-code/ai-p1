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
    resolver: zodResolver(brandSetupSchema as any),
    defaultValues: { brandColor: defaultBrandColor },
  });
  
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <Card className="w-full rounded-[24px] border border-border bg-[oklch(99%_0.004_255)] dark:border-white/10 dark:bg-[oklch(13%_0.016_255)]">
        <CardHeader className="pb-8 pt-8">
          <CardTitle className="text-2xl font-semibold tracking-0 text-foreground text-start">{t("title")}</CardTitle>
          <CardDescription className="mt-2 text-sm font-medium leading-6 text-muted-foreground text-start dark:text-muted-foreground">
            {t("desc")}
          </CardDescription>
        </CardHeader>
      
        <CardContent className="space-y-8 px-8">
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              <Label htmlFor="brandColor" className="text-sm font-semibold text-foreground dark:text-muted-foreground/40">{t("color")}</Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("brandColorTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl border border-border dark:border-white/10 shrink-0" style={{ backgroundColor: defaultBrandColor }} />
                <Input id="brandColor" placeholder={defaultBrandColor} className="h-12 rounded-2xl border-border bg-transparent px-4 text-sm font-medium focus-visible:ring-blue-600/15 dark:border-white/10 font-mono" aria-invalid={Boolean(errors.brandColor)} {...register("brandColor")} />
              </div>
              {errors.brandColor && <p className="text-xs font-semibold text-red-600">{errors.brandColor.message}</p>}
            </div>


          <div className="space-y-3">
            <FileUploadZone 
              label={
                <div className="flex items-center gap-1">
                  {t("logo")} <span className="ms-1 font-medium normal-case tracking-normal text-muted-foreground">{tc("optional")}</span>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex cursor-help">
                      <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{t("logoTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              } 
              accept="image/png,image/jpeg,image/svg+xml"
              description={t("logoDesc")} 
            />
          </div>
        </CardContent>

        <CardFooter className="pt-8 pb-8 px-8 flex items-center justify-between rtl:flex-row-reverse border-t border-border dark:border-white/10 mt-8">
          <Button variant="ghost" type="button" className="text-sm font-semibold text-muted-foreground hover:text-foreground" onClick={onBack}>
            {tc("back")}
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" type="button" className="text-sm font-semibold text-muted-foreground hover:text-foreground" onClick={onNext}>
              {tc("skipStep")}
            </Button>
            <Button className="h-12 px-7 rounded-2xl bg-foreground text-sm font-bold text-white hover:bg-foreground/90 dark:bg-white dark:text-foreground dark:hover:bg-muted" type="submit">
              {t("continue")}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
