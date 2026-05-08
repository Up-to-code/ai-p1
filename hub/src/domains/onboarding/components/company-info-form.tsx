"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { companyInfoSchema, type CompanyInfoInput } from "../validation/onboarding.schema";

interface FormProps {
  onNext: () => void;
}

export function CompanyInfoForm({ onNext }: FormProps) {
  const t = useTranslations("Onboarding.company");
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyInfoInput>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: { legalName: "", displayName: "", crNumber: "", hqCity: "" },
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
            <Label htmlFor="legalName" className="text-sm font-medium">{t("legalName")}</Label>
            <Input id="legalName" placeholder="e.g. Acme Real Estate LLC" className="h-10 border-border/60 focus-visible:ring-primary/20" aria-invalid={Boolean(errors.legalName)} {...register("legalName")} />
            {errors.legalName && <p className="text-xs font-bold text-red-600">{errors.legalName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium">{t("displayName")}</Label>
            <Input id="displayName" placeholder="e.g. Acme" className="h-10 border-border/60 focus-visible:ring-primary/20" aria-invalid={Boolean(errors.displayName)} {...register("displayName")} />
            {errors.displayName && <p className="text-xs font-bold text-red-600">{errors.displayName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="crNumber" className="text-sm font-medium">{t("crNumber")}</Label>
            <Input id="crNumber" placeholder="1010XXXXXX" className="h-10 border-border/60 focus-visible:ring-primary/20" aria-invalid={Boolean(errors.crNumber)} {...register("crNumber")} />
            {errors.crNumber && <p className="text-xs font-bold text-red-600">{errors.crNumber.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="hqCity" className="text-sm font-medium">{t("city")}</Label>
            <Input id="hqCity" placeholder="e.g. Riyadh" className="h-10 border-border/60 focus-visible:ring-primary/20" aria-invalid={Boolean(errors.hqCity)} {...register("hqCity")} />
            {errors.hqCity && <p className="text-xs font-bold text-red-600">{errors.hqCity.message}</p>}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-6 border-t border-border/40 flex items-center justify-end">
        <div className="flex gap-3">
          <Button variant="ghost" className="h-10 text-text-secondary">{t("saveDraft")}</Button>
          <Button className="h-10" type="submit">{t("continue")}</Button>
        </div>
      </CardFooter>
      </Card>
    </form>
  );
}
