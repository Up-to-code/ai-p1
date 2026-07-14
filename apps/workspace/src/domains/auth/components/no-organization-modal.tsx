"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { AlertCircle, ArrowRight, Check, Globe2, Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/routing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { writeAuthHandoff } from "@/domains/auth/auth-handoff";
import { completeOrganizationEntry } from "../organization-selection";
import {
  createOrganizationWithUniqueSlug,
  organizationSlugFromName,
} from "../organization-creation";

export function NoOrganizationModal() {
  const t = useTranslations("NoOrganizationModal");
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState("");
  const [busyAction, setBusyAction] = useState<"create" | "">("");
  const [error, setError] = useState("");
  const seedWorkspaceDefaults = useMutation(
    api.modelization.write.seedWorkspaceDefaults,
  );

  const isBusy = busyAction !== "";
  const organizationSlug = organizationSlugFromName(organizationName);

  async function createOrganization() {
    const name = organizationName.trim();
    if (!name) {
      setError(t("nameRequired"));
      return;
    }

    setBusyAction("create");
    setError("");
    try {
      const organization = await createOrganizationWithUniqueSlug({
        name,
        checkSlug: (input) => authClient.organization.checkSlug(input),
        create: (input) => authClient.organization.create(input),
      });
      if (!organization.id) throw new Error(t("errorDesc"));

      await completeOrganizationEntry({
        organizationId: organization.id,
        setActive: authClient.organization.setActive,
        writeHandoff: writeAuthHandoff,
        seedWorkspace: (organizationId) =>
          seedWorkspaceDefaults({ organizationId }),
        navigate: (href) => router.replace(href),
        nextHref: "/ws",
        errorMessage: t("errorDesc"),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errorDesc"));
    } finally {
      setBusyAction("");
    }
  }

  return (
    <Dialog open>
      <DialogContent
        className="max-w-md rounded-md border border-border bg-background p-6 shadow-none"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700 dark:bg-red-400/10 dark:text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="no-org-name"
              className="text-xs font-medium text-text-secondary"
            >
              {t("nameLabel")}
            </Label>
            <Input
              className="h-11 rounded-md"
              id="no-org-name"
              onChange={(event) => {
                setOrganizationName(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isBusy) {
                  void createOrganization();
                }
              }}
              placeholder={t("namePlaceholder")}
              value={organizationName}
            />
          </div>

          <div className="rounded-md border border-border bg-muted/35 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Globe2 className="h-4 w-4 text-muted-foreground" />
              <span>{t("slugLabel")}</span>
            </div>
            <p className="mt-2 truncate rounded bg-background px-2.5 py-2 font-mono text-xs text-muted-foreground" dir="ltr">
              qentrah.com/{organizationSlug}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {t("slugHint")}
            </p>
          </div>

          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            {[t("journeyCreate"), t("journeyActivate"), t("journeyOpen")].map(
              (label) => (
                <div className="flex items-center gap-2" key={label}>
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                    <Check className="size-3" />
                  </span>
                  <span>{label}</span>
                </div>
              ),
            )}
          </div>

          <Button
            className="h-11 w-full rounded-md bg-foreground text-sm font-semibold text-background hover:bg-foreground/90"
            disabled={isBusy}
            onClick={() => void createOrganization()}
            type="button"
          >
            {busyAction === "create" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {busyAction === "create" ? t("creating") : t("createBtn")}
            {busyAction === "create" ? null : (
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            )}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-popover px-2 text-text-secondary">{t("or")}</span>
            </div>
          </div>

          <div className="rounded-md border border-border bg-muted/40 p-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-text-secondary" />
              <div>
                <p className="text-sm font-bold text-foreground">{t("invitationTitle")}</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  {t("invitationDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
