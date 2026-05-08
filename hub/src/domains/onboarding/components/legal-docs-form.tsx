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
            <Label htmlFor="authName" className="text-sm font-medium">{t("signerName")}</Label>
            <Input id="authName" placeholder="e.g. Ahmed Mansour" className="h-10 border-border/60 focus-visible:ring-primary/20" aria-invalid={Boolean(errors.authName)} {...register("authName")} />
            {errors.authName && <p className="text-xs font-bold text-red-600">{errors.authName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="authTitle" className="text-sm font-medium">{t("signerTitle")}</Label>
            <Input id="authTitle" placeholder="e.g. Chief Executive Officer" className="h-10 border-border/60 focus-visible:ring-primary/20" aria-invalid={Boolean(errors.authTitle)} {...register("authTitle")} />
            {errors.authTitle && <p className="text-xs font-bold text-red-600">{errors.authTitle.message}</p>}
          </div>
        </div>

        <FileUploadZone 
          label={t("crDoc")} 
          description={t("crDesc")} 
        />
        <FileUploadZone 
          label={t("authLetter")} 
          description={t("authDesc")} 
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
