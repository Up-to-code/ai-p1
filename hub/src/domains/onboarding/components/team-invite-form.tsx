"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { UserPlus, Trash2, HelpCircle, Loader2 } from "lucide-react";
import { teamInviteSchema, type TeamInviteInput } from "../validation/onboarding.schema";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FormProps {
  onBack: () => void;
  onFinish: () => void;
}

export function TeamInviteForm({ onBack, onFinish }: FormProps) {
  const t = useTranslations("Onboarding.team");
  const tc = useTranslations("Common");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async () => {
    setIsSubmitting(true);
    // Simulate API submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    onFinish();
  };

  const { register, handleSubmit, formState: { errors } } = useForm<TeamInviteInput>({
    resolver: zodResolver(teamInviteSchema),
    defaultValues: { inviteEmail: "", inviteRole: "Project Editor" },
  });
  
  return (
    <form onSubmit={handleSubmit(() => undefined)}>
      <Card className="w-full border-0 shadow-none bg-zinc-50 dark:bg-white/[0.02] rounded-[24px]">
        <CardHeader className="pb-8 pt-8">
          <CardTitle className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white text-start">{t("title")}</CardTitle>
          <CardDescription className="text-xs font-bold text-zinc-500 text-start mt-2">
            {t("desc")}
          </CardDescription>
        </CardHeader>
      
        <CardContent className="space-y-8 px-8">
          {/* Inline Add Form */}
          <div className="flex flex-col md:flex-row items-end gap-4 bg-white dark:bg-[#0A0A0A] p-6 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
            <div className="w-full md:flex-1 space-y-3">
              <div className="flex items-center gap-1">
                <Label htmlFor="inviteEmail" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("emailLabel")}</Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-900 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("emailTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input id="inviteEmail" placeholder={t("emailPlaceholder")} className="h-12 rounded-xl border-zinc-200 bg-white font-medium focus-visible:ring-blue-600/20 dark:border-white/10 dark:bg-[#0A0A0A]" aria-invalid={Boolean(errors.inviteEmail)} {...register("inviteEmail")} />
              {errors.inviteEmail && <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{errors.inviteEmail.message}</p>}
            </div>
            <div className="w-full md:w-48 space-y-3">
              <div className="flex items-center gap-1">
                <Label htmlFor="inviteRole" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("roleLabel")}</Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-900 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("roleTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input id="inviteRole" placeholder="Admin" className="h-12 rounded-xl border-zinc-200 bg-white font-medium focus-visible:ring-blue-600/20 dark:border-white/10 dark:bg-[#0A0A0A] text-zinc-500 cursor-not-allowed" readOnly {...register("inviteRole")} />
            </div>
            <Button className="w-full md:w-auto h-12 px-6 rounded-xl bg-zinc-900 text-white hover:bg-black font-black uppercase tracking-widest text-[10px] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all" type="button">
              <UserPlus className="w-4 h-4 me-2 rtl:ms-2 rtl:me-0" />
              {t("addBtn")}
            </Button>
          </div>

          {/* Pending Invites Table */}
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0A0A0A]">
            <table className="w-full text-sm text-start">
              <thead className="bg-zinc-50 dark:bg-white/[0.02] border-b border-zinc-200 dark:border-white/10 text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-start">{t("tableEmail")}</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-start">{t("tableRole")}</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-end">{t("tableActions")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-white/5 last:border-0 bg-transparent transition-colors hover:bg-zinc-50/50 dark:hover:bg-white/[0.01]">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">developer@acme.com</td>
                  <td className="px-6 py-4 text-zinc-500 font-medium text-xs">Organization Admin</td>
                  <td className="px-6 py-4 text-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>

        <CardFooter className="pt-8 pb-8 px-8 flex items-center justify-between rtl:flex-row-reverse border-t border-zinc-200 dark:border-white/10 mt-8">
          <Button variant="ghost" type="button" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white" onClick={onBack} disabled={isSubmitting}>
            {tc("back")}
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" type="button" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white" onClick={handleFinish} disabled={isSubmitting}>
              {tc("saveAndExit")}
            </Button>
            <Button 
              className="h-14 px-8 rounded-[28px] bg-zinc-900 text-white hover:bg-black font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-zinc-900/20 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none" 
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin rtl:ms-2 rtl:me-0" />
                  {t("submit")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
