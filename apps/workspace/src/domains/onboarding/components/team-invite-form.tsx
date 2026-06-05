"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  createOrganizationInvitation,
  cancelOrganizationInvitation,
  listOrganizationInvitations,
  listOrganizationMembers,
  listOrganizationRoles,
  type OrganizationInvitation,
  type OrganizationMember,
  type OrganizationRole,
} from "@/domains/organization/api/clerk-organization-api";
import { formatRoleName } from "@/domains/organization/settings-view-model";
import { UserPlus, Trash2, HelpCircle, Loader2 } from "lucide-react";
import { teamInviteSchema, type TeamInviteInput } from "../validation/onboarding.schema";
import {
  inviteEmailBlockReason,
  normalizeInviteEmail,
  onboardingInviteRoleOptions,
  pendingInvitations,
} from "../team-invite-view-model";

interface FormProps {
  organizationId: string;
  currentUserEmail?: string | null;
  onBack: () => void;
  onFinish: () => void | Promise<void>;
}

export function TeamInviteForm({ organizationId, currentUserEmail, onBack, onFinish }: FormProps) {
  const t = useTranslations("Onboarding.team");
  const tc = useTranslations("Common");
  const tr = useTranslations("Organization.roles.defaultLabels");
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [cancelingInviteId, setCancelingInviteId] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    resetField,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<TeamInviteInput>({
    resolver: zodResolver(teamInviteSchema),
    defaultValues: { inviteEmail: "", inviteRole: "member" },
  });

  const selectedRole = useWatch({ control, name: "inviteRole" });
  const visibleInvitations = useMemo(() => pendingInvitations(invitations), [invitations]);
  const availableRoles = useMemo(() => onboardingInviteRoleOptions(roles), [roles]);
  const defaultRoleLabels = useMemo(() => ({
    owner: tr("owner"),
    admin: tr("admin"),
    member: tr("member"),
  }), [tr]);
  const isBusy = isLoading || isAdding || Boolean(cancelingInviteId) || isFinishing;

  const refreshInviteState = useCallback(async () => {
    setLoadError(null);
    const [nextMembers, nextInvitations, nextRoles] = await Promise.all([
      listOrganizationMembers(organizationId),
      listOrganizationInvitations(organizationId),
      listOrganizationRoles(organizationId),
    ]);

    setMembers(nextMembers);
    setInvitations(nextInvitations);
    setRoles(nextRoles);
  }, [organizationId]);

  useEffect(() => {
    let isActive = true;

    async function load() {
      setIsLoading(true);
      try {
        await refreshInviteState();
      } catch (caught) {
        if (!isActive) return;
        const message = caught instanceof Error ? caught.message : t("loadFailed");
        setLoadError(message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [refreshInviteState, t]);

  async function addInvite(values: TeamInviteInput) {
    const email = normalizeInviteEmail(values.inviteEmail);
    const blockReason = inviteEmailBlockReason({
      email,
      currentUserEmail,
      members,
      invitations,
    });

    if (blockReason) {
      setError("inviteEmail", { type: "manual", message: t(`errors.${blockReason}`) });
      return;
    }

    setIsAdding(true);
    try {
      await createOrganizationInvitation(organizationId, {
        email,
        role: values.inviteRole,
      });
      await refreshInviteState();
      resetField("inviteEmail");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : t("errors.createFailed");
      setError("inviteEmail", { type: "manual", message });
    } finally {
      setIsAdding(false);
    }
  }

  async function cancelInvite(invitationId: string) {
    setCancelingInviteId(invitationId);
    setLoadError(null);
    try {
      await cancelOrganizationInvitation(organizationId, invitationId);
      await refreshInviteState();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : t("errors.cancelFailed");
      setLoadError(message);
    } finally {
      setCancelingInviteId(null);
    }
  }

  async function handleFinish() {
    if (isAdding || cancelingInviteId) return;
    setIsFinishing(true);
    try {
      await onFinish();
    } finally {
      setIsFinishing(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit(addInvite)}>
      <Card className="w-full rounded-[24px] border border-zinc-200 bg-[oklch(99%_0.004_255)] dark:border-white/10 dark:bg-[oklch(13%_0.016_255)]">
        <CardHeader className="pb-8 pt-8">
          <CardTitle className="text-start text-2xl font-semibold tracking-0 text-zinc-950 dark:text-white">{t("title")}</CardTitle>
          <CardDescription className="mt-2 text-start text-sm font-medium leading-6 text-zinc-500 dark:text-zinc-400">
            {t("desc")}
          </CardDescription>
        </CardHeader>
      
        <CardContent className="space-y-8 px-8">
          <div className="grid items-end gap-4 bg-transparent p-0 md:grid-cols-[minmax(0,1fr)_220px_auto]">
            <div className="w-full space-y-3">
              <div className="flex items-center gap-1">
                <Label htmlFor="inviteEmail" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("emailLabel")}</Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="h-3 w-3 text-zinc-400 transition-colors hover:text-zinc-900" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("emailTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="inviteEmail"
                type="email"
                placeholder={t("emailPlaceholder")}
                className="h-12 rounded-2xl border-zinc-200 bg-transparent px-4 text-sm font-medium focus-visible:ring-blue-600/15 dark:border-white/10"
                aria-invalid={Boolean(errors.inviteEmail)}
                disabled={isBusy}
                {...register("inviteEmail")}
              />
              {errors.inviteEmail && <p className="text-xs font-semibold text-red-600">{errors.inviteEmail.message}</p>}
            </div>
            <div className="w-full space-y-3">
              <div className="flex items-center gap-1">
                <Label htmlFor="inviteRole" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("roleLabel")}</Label>
                <Tooltip>
                  <TooltipTrigger className="inline-flex cursor-help">
                    <HelpCircle className="h-3 w-3 text-zinc-400 transition-colors hover:text-zinc-900" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("roleTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={selectedRole}
                onValueChange={(value) => value && setValue("inviteRole", value, { shouldValidate: true })}
                disabled={isBusy || availableRoles.length === 0}
              >
                <SelectTrigger
                  id="inviteRole"
                  aria-label={t("roleLabel")}
                  className="h-12 rounded-2xl border-zinc-200 bg-transparent px-4 text-sm font-medium focus-visible:ring-blue-600/15 dark:border-white/10"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {formatRoleName(role, defaultRoleLabels)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.inviteRole && <p className="text-xs font-semibold text-red-600">{errors.inviteRole.message}</p>}
            </div>
            <Button
              className="h-12 w-full rounded-2xl bg-zinc-950 px-6 text-sm font-bold text-white hover:bg-black disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 md:w-auto"
              type="submit"
              disabled={isBusy}
            >
              {isAdding ? <Loader2 className="me-2 h-4 w-4 animate-spin rtl:ms-2 rtl:me-0" /> : <UserPlus className="me-2 h-4 w-4 rtl:ms-2 rtl:me-0" />}
              {t("addBtn")}
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-transparent dark:border-white/10">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-4 text-start text-xs font-semibold">{t("tableEmail")}</th>
                  <th className="px-6 py-4 text-start text-xs font-semibold">{t("tableRole")}</th>
                  <th className="px-6 py-4 text-end text-xs font-semibold">{t("tableActions")}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      <Loader2 className="me-2 inline h-4 w-4 animate-spin" />
                      {t("loadingInvites")}
                    </td>
                  </tr>
                ) : visibleInvitations.length > 0 ? (
                  visibleInvitations.map((invitation) => (
                    <tr key={invitation.id} className="border-b border-zinc-100 bg-transparent transition-colors last:border-0 hover:bg-zinc-50/50 dark:border-white/5 dark:hover:bg-white/[0.01]">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{invitation.email}</td>
                      <td className="px-6 py-4 text-xs font-medium text-zinc-500">{formatRoleName(invitation.role, defaultRoleLabels)}</td>
                      <td className="px-6 py-4 text-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          aria-label={t("cancelInvite")}
                          disabled={isBusy}
                          onClick={() => void cancelInvite(invitation.id)}
                          className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-500/10"
                        >
                          {cancelingInviteId === invitation.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {t("emptyInvites")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {loadError && <p className="text-xs font-semibold text-red-600">{loadError}</p>}
        </CardContent>

        <CardFooter className="mt-8 flex items-center justify-between border-t border-zinc-200 px-8 pb-8 pt-8 rtl:flex-row-reverse dark:border-white/10">
          <Button variant="ghost" type="button" className="text-sm font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white" onClick={onBack} disabled={isBusy}>
            {tc("back")}
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" type="button" className="text-sm font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white" onClick={handleFinish} disabled={isBusy}>
              {tc("saveAndExit")}
            </Button>
            <Button 
              className="h-12 rounded-2xl bg-zinc-950 px-7 text-sm font-bold text-white hover:bg-black disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
              type="button"
              onClick={handleFinish}
              disabled={isBusy}
            >
              {isFinishing ? (
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
