"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Trash2 } from "lucide-react";
import { teamInviteSchema, type TeamInviteInput } from "../validation/onboarding.schema";

interface FormProps {
  onBack: () => void;
}

export function TeamInviteForm({ onBack }: FormProps) {
  const t = useTranslations("Onboarding.team");
  const tc = useTranslations("Common");
  const { register, handleSubmit, formState: { errors } } = useForm<TeamInviteInput>({
    resolver: zodResolver(teamInviteSchema),
    defaultValues: { inviteEmail: "", inviteRole: "Project Editor" },
  });
  
  return (
    <form onSubmit={handleSubmit(() => undefined)}>
    <Card className="w-full border-border/60 shadow-none bg-background">
      <CardHeader className="pb-6 border-b border-border/40">
        <CardTitle className="text-xl">{t("title")}</CardTitle>
        <CardDescription className="text-base text-text-secondary">
          {t("desc")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-8 space-y-8">
        {/* Inline Add Form */}
        <div className="flex items-end gap-4 bg-surface p-4 rounded-xl border border-border/60">
          <div className="flex-1 space-y-2">
            <Label htmlFor="inviteEmail" className="text-xs font-medium text-text-secondary">{t("emailLabel")}</Label>
            <Input id="inviteEmail" placeholder="colleague@company.com" className="h-9 bg-background border-border/60 focus-visible:ring-primary/20" aria-invalid={Boolean(errors.inviteEmail)} {...register("inviteEmail")} />
            {errors.inviteEmail && <p className="text-xs font-bold text-red-600">{errors.inviteEmail.message}</p>}
          </div>
          <div className="w-48 space-y-2">
            <Label htmlFor="inviteRole" className="text-xs font-medium text-text-secondary">{t("roleLabel")}</Label>
            <Input id="inviteRole" placeholder="Admin" className="h-9 bg-background border-border/60 focus-visible:ring-primary/20" readOnly {...register("inviteRole")} />
          </div>
          <Button size="sm" className="h-9" type="submit">
            <UserPlus className="w-4 h-4 me-2" />
            {t("addBtn")}
          </Button>
        </div>

        {/* Pending Invites Table */}
        <div className="rounded-lg border border-border/40 overflow-hidden">
          <table className="w-full text-sm text-start">
            <thead className="bg-surface border-b border-border/40 text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{t("tableEmail")}</th>
                <th className="px-4 py-3 font-medium">{t("tableRole")}</th>
                <th className="px-4 py-3 font-medium text-end">{t("tableActions")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/40 bg-background">
                <td className="px-4 py-3 font-medium text-text-primary">developer@acme.com</td>
                <td className="px-4 py-3 text-text-secondary">Organization Admin</td>
                <td className="px-4 py-3 text-end">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-error">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>

      <CardFooter className="pt-6 border-t border-border/40 flex items-center justify-between">
        <Button variant="secondary" className="h-10" onClick={onBack}>{tc("back")}</Button>
        <div className="flex gap-3">
          <Button variant="ghost" className="h-10 text-text-secondary">{t("skip")}</Button>
          <Button className="h-10 shadow-none" variant="default" type="button">{t("submit")}</Button>
        </div>
      </CardFooter>
    </Card>
    </form>
  );
}
