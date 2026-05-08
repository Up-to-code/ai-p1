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

interface FormProps {
  onNext: () => void;
  onBack: () => void;
}

export function BrandSetupForm({ onNext, onBack }: FormProps) {
  const t = useTranslations("Onboarding.brand");
  const tc = useTranslations("Common");
  const { register, handleSubmit, formState: { errors } } = useForm<BrandSetupInput>({
    resolver: zodResolver(brandSetupSchema),
    defaultValues: { brandName: "", brandColor: "#2563EB" },
  });
  
  return (
    <form onSubmit={handleSubmit(onNext)}>
    <Card className="w-full border-border/60 shadow-none bg-background">
      <CardHeader className="pb-6 border-b border-border/40">
        <CardTitle className="text-xl">{t("title")}</CardTitle>
        <CardDescription className="text-base text-text-secondary">
          {t("desc")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="brandName" className="text-sm font-medium">{t("displayName")}</Label>
            <Input id="brandName" placeholder="e.g. Acme" className="h-10 border-border/60 focus-visible:ring-primary/20" aria-invalid={Boolean(errors.brandName)} {...register("brandName")} />
            {errors.brandName && <p className="text-xs font-bold text-red-600">{errors.brandName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="brandColor" className="text-sm font-medium">{t("color")}</Label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded border border-border/60 bg-primary shadow-none" />
              <Input id="brandColor" placeholder="#2563EB" className="h-10 border-border/60 focus-visible:ring-primary/20 font-mono" aria-invalid={Boolean(errors.brandColor)} {...register("brandColor")} />
            </div>
            {errors.brandColor && <p className="text-xs font-bold text-red-600">{errors.brandColor.message}</p>}
          </div>
        </div>

        <FileUploadZone 
          label={t("logo")} 
          description={t("logoDesc")} 
        />
      </CardContent>

      <CardFooter className="pt-6 border-t border-border/40 flex items-center justify-between">
        <Button variant="secondary" className="h-10" onClick={onBack}>{tc("back")}</Button>
        <div className="flex gap-3">
          <Button variant="ghost" className="h-10 text-text-secondary">{useTranslations("Onboarding.company")("saveDraft")}</Button>
          <Button className="h-10" type="submit">{t("continue")}</Button>
        </div>
      </CardFooter>
    </Card>
    </form>
  );
}
