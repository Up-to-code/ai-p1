"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { AlertCircle, ArrowRight, Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
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

type ClerkOrganization = {
  id: string;
  name?: string | null;
  slug?: string | null;
};

function isOrganizationsDisabledError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("organizations feature is not enabled");
}

function isOrganizationSlugsDisabledError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("does not have slugs enabled");
}

export function NoOrganizationModal() {
  const t = useTranslations("NoOrganizationModal");
  const router = useRouter();
  const clerk = useClerk();
  const { isLoaded: userLoaded } = useUser();
  const [organizationName, setOrganizationName] = useState("");
  const [busyAction, setBusyAction] = useState<"create" | "">("");
  const [error, setError] = useState("");

  const isBusy = busyAction !== "";

  async function createOrganization() {
    const name = organizationName.trim();
    if (!name) {
      setError(t("nameRequired"));
      return;
    }

    setBusyAction("create");
    setError("");
    try {
      const clerkApi = clerk as unknown as {
        createOrganization?: (input: { name: string }) => Promise<ClerkOrganization>;
      };
      const organization = await clerkApi.createOrganization?.({ name });
      if (!organization?.id) throw new Error(t("errorDesc"));
      await clerk.setActive({ organization: organization.id });
      router.replace("/onboarding");
    } catch (caught) {
      if (isOrganizationsDisabledError(caught)) {
        setError(t("organizationsDisabled"));
        return;
      }
      if (isOrganizationSlugsDisabledError(caught)) {
        setError(t("slugsDisabled"));
        return;
      }
      setError(caught instanceof Error ? caught.message : t("errorDesc"));
    } finally {
      setBusyAction("");
    }
  }

  if (!userLoaded) return null;

  return (
    <Dialog open>
      <DialogContent
        className="max-w-md"
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

          <div className="space-y-2">
            <Label
              htmlFor="no-org-name"
              className="text-xs font-black uppercase tracking-[0.08em] text-text-secondary"
            >
              {t("nameLabel")}
            </Label>
            <Input
              className="h-12 rounded-2xl"
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

          <Button
            className="h-12 w-full rounded-2xl text-sm font-bold"
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

          <div className="rounded-xl border border-border bg-muted/40 p-4">
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
